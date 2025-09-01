const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const database = require('../config/database');
const Helpers = require('../utils/helpers');

class ExportService {
  /**
   * Export des personnes en Excel
   */
  static async exportPersonsToExcel(filters = {}) {
    const prisma = database.getClient();
    
    // Récupérer les données
    const persons = await prisma.person.findMany({
      where: this.buildPersonsFilter(filters),
      include: {
        assignedMentor: {
          select: { firstName: true, lastName: true }
        },
        creator: {
          select: { firstName: true, lastName: true }
        },
        _count: {
          select: { followUps: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Créer workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nouveaux Visiteurs');

    // Headers
    worksheet.columns = [
      { header: 'Nom', key: 'lastName', width: 20 },
      { header: 'Prénom', key: 'firstName', width: 20 },
      { header: 'Genre', key: 'gender', width: 10 },
      { header: 'Téléphone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Commune', key: 'commune', width: 15 },
      { header: 'Quartier', key: 'quartier', width: 15 },
      { header: 'Profession', key: 'profession', width: 20 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Mentor Assigné', key: 'mentorName', width: 25 },
      { header: 'Date Première Visite', key: 'firstVisitDate', width: 20 },
      { header: 'Nb Suivis', key: 'followUpsCount', width: 12 },
      { header: 'Enregistré par', key: 'createdBy', width: 25 },
      { header: 'Date Enregistrement', key: 'createdAt', width: 20 }
    ];

    // Style des headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Données
    persons.forEach(person => {
      worksheet.addRow({
        lastName: person.lastName,
        firstName: person.firstName,
        gender: person.gender,
        phone: person.phone,
        email: person.email,
        commune: person.commune,
        quartier: person.quartier,
        profession: person.profession,
        status: this.getStatusLabel(person.status),
        mentorName: person.assignedMentor ? 
          `${person.assignedMentor.firstName} ${person.assignedMentor.lastName}` : 
          'Non assigné',
        firstVisitDate: Helpers.formatDate(person.firstVisitDate),
        followUpsCount: person._count.followUps,
        createdBy: `${person.creator.firstName} ${person.creator.lastName}`,
        createdAt: Helpers.formatDate(person.createdAt, 'dd/MM/yyyy HH:mm')
      });
    });

    // Générer fichier
    const fileName = `export_nouveaux_${Helpers.formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
    const filePath = path.join('uploads', fileName);
    
    await workbook.xlsx.writeFile(filePath);
    
    return {
      fileName,
      filePath,
      recordsCount: persons.length
    };
  }

  /**
   * Export des suivis en Excel
   */
  static async exportFollowUpsToExcel(filters = {}) {
    const prisma = database.getClient();
    
    const followUps = await prisma.followUp.findMany({
      where: this.buildFollowUpsFilter(filters),
      include: {
        person: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            commune: true
          }
        },
        mentor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { interactionDate: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historique Suivis');

    worksheet.columns = [
      { header: 'Visiteur', key: 'personName', width: 25 },
      { header: 'Mentor', key: 'mentorName', width: 25 },
      { header: 'Type Interaction', key: 'interactionType', width: 15 },
      { header: 'Date', key: 'interactionDate', width: 15 },
      { header: 'Résultat', key: 'outcome', width: 15 },
      { header: 'Notes', key: 'notes', width: 40 },
      { header: 'Action Suivante', key: 'nextActionNeeded', width: 15 },
      { header: 'Date Action', key: 'nextActionDate', width: 15 },
      { header: 'Notes Action', key: 'nextActionNotes', width: 30 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    followUps.forEach(followUp => {
      worksheet.addRow({
        personName: `${followUp.person.firstName} ${followUp.person.lastName}`,
        mentorName: `${followUp.mentor.firstName} ${followUp.mentor.lastName}`,
        interactionType: this.getInteractionTypeLabel(followUp.interactionType),
        interactionDate: Helpers.formatDate(followUp.interactionDate),
        outcome: this.getOutcomeLabel(followUp.outcome),
        notes: followUp.notes,
        nextActionNeeded: followUp.nextActionNeeded ? 'Oui' : 'Non',
        nextActionDate: followUp.nextActionDate ? Helpers.formatDate(followUp.nextActionDate) : '',
        nextActionNotes: followUp.nextActionNotes
      });
    });

    const fileName = `export_suivis_${Helpers.formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
    const filePath = path.join('uploads', fileName);
    
    await workbook.xlsx.writeFile(filePath);
    
    return {
      fileName,
      filePath,
      recordsCount: followUps.length
    };
  }

  /**
   * Export CSV générique
   */
  static async exportToCSV(data, fields, fileName) {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    const filePath = path.join('uploads', fileName);
    fs.writeFileSync(filePath, csv);
    
    return {
      fileName,
      filePath,
      recordsCount: data.length
    };
  }

  /**
   * Helpers pour filtres
   */
  static buildPersonsFilter(filters) {
    const where = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.mentorId) where.assignedMentorId = filters.mentorId;
    if (filters.commune) where.commune = { contains: filters.commune };
    
    if (filters.startDate || filters.endDate) {
      where.firstVisitDate = {};
      if (filters.startDate) where.firstVisitDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.firstVisitDate.lte = new Date(filters.endDate);
    }
    
    return where;
  }

  static buildFollowUpsFilter(filters) {
    const where = {};
    
    if (filters.personId) where.personId = filters.personId;
    if (filters.mentorId) where.mentorId = filters.mentorId;
    if (filters.outcome) where.outcome = filters.outcome;
    
    if (filters.startDate || filters.endDate) {
      where.interactionDate = {};
      if (filters.startDate) where.interactionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.interactionDate.lte = new Date(filters.endDate);
    }
    
    return where;
  }

  /**
   * Labels pour affichage
   */
  static getStatusLabel(status) {
    const labels = {
      [Constants.PERSON_STATUS.TO_VISIT]: 'À visiter',
      [Constants.PERSON_STATUS.IN_FOLLOW_UP]: 'En suivi',
      [Constants.PERSON_STATUS.INTEGRATED]: 'Intégré(e)',
      [Constants.PERSON_STATUS.TO_REDIRECT]: 'À réorienter',
      [Constants.PERSON_STATUS.LONG_ABSENT]: 'Absent(e) prolongé(e)'
    };
    return labels[status] || status;
  }

  static getInteractionTypeLabel(type) {
    const labels = {
      [Constants.INTERACTION_TYPES.VISIT]: 'Visite',
      [Constants.INTERACTION_TYPES.CALL]: 'Appel',
      [Constants.INTERACTION_TYPES.MEETING]: 'Rencontre',
      [Constants.INTERACTION_TYPES.OTHER]: 'Autre'
    };
    return labels[type] || type;
  }

  static getOutcomeLabel(outcome) {
    const labels = {
      [Constants.OUTCOMES.POSITIVE]: 'Positif',
      [Constants.OUTCOMES.NEUTRAL]: 'Neutre',
      [Constants.OUTCOMES.NEGATIVE]: 'Négatif',
      [Constants.OUTCOMES.NO_CONTACT]: 'Pas de contact'
    };
    return labels[outcome] || outcome;
  }
}

module.exports = ExportService;