const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // 1. Nettoyage des données existantes (optionnel)
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.notification.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.person.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // 2. Création des paramètres système
  console.log('⚙️ Création des paramètres système...');
  await prisma.setting.createMany({
    data: [
      {
        key: 'reminder_days_new',
        value: '3',
        description: 'Jours avant rappel pour nouveau visiteur'
      },
      {
        key: 'reminder_days_follow_up',
        value: '7',
        description: 'Jours avant rappel de suivi régulier'
      },
      {
        key: 'auto_assignment_enabled',
        value: 'true',
        description: 'Attribution automatique des mentors'
      },
      {
        key: 'max_persons_per_mentor',
        value: '10',
        description: 'Nombre max de personnes par mentor'
      }
    ]
  });

  // 3. Hash des mots de passe
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // 4. Création utilisateur admin par défaut
  console.log('👤 Création utilisateur admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ruach.church',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      churchSection: 'Administration'
    }
  });

  // 5. Création membres CAN
  console.log('👥 Création membres CAN...');
  const canMembers = await prisma.user.createMany({
    data: [
      {
        email: 'accueil1@ruach.church',
        passwordHash: userPassword,
        firstName: 'Marie',
        lastName: 'KOUASSI',
        phone: '+225 01 02 03 04 05',
        role: 'can_committee',
        churchSection: 'Accueil'
      },
      {
        email: 'accueil2@ruach.church',
        passwordHash: userPassword,
        firstName: 'Jean',
        lastName: 'KONE',
        phone: '+225 01 02 03 04 06',
        role: 'can_committee',
        churchSection: 'Accueil'
      }
    ]
  });

  // 6. Création mentors/encadreurs
  console.log('🤝 Création mentors...');
  const mentors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'mentor.jeunes@ruach.church',
        passwordHash: userPassword,
        firstName: 'Pierre',
        lastName: 'DIABATE',
        phone: '+225 07 08 09 10 11',
        role: 'mentor',
        churchSection: 'Jeunes'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mentor.adultes@ruach.church',
        passwordHash: userPassword,
        firstName: 'Fatou',
        lastName: 'TRAORE',
        phone: '+225 07 08 09 10 12',
        role: 'mentor',
        churchSection: 'Adultes'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mentor.femmes@ruach.church',
        passwordHash: userPassword,
        firstName: 'Grace',
        lastName: 'OUATTARA',
        phone: '+225 07 08 09 10 13',
        role: 'mentor',
        churchSection: 'Femmes'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mentor.hommes@ruach.church',
        passwordHash: userPassword,
        firstName: 'David',
        lastName: 'YAO',
        phone: '+225 07 08 09 10 14',
        role: 'mentor',
        churchSection: 'Hommes'
      }
    })
  ]);

  // 7. Création pasteurs
  console.log('⛪ Création pasteurs...');
  const pastor = await prisma.user.create({
    data: {
      email: 'pasteur@ruach.church',
      passwordHash: userPassword,
      firstName: 'Emmanuel',
      lastName: 'GBOGBO',
      phone: '+225 05 06 07 08 09',
      role: 'pastor',
      churchSection: 'Direction'
    }
  });

  // 8. Création visiteurs de test
  console.log('🚶 Création visiteurs de test...');
  const visitors = await Promise.all([
    prisma.person.create({
      data: {
        firstName: 'Aminata',
        lastName: 'SANOGO',
        gender: 'F',
        dateOfBirth: new Date('1995-03-15'),
        phone: '+225 01 23 45 67 89',
        email: 'aminata.sanogo@email.com',
        address: '123 Boulevard Lagunaire',
        commune: 'Cocody',
        quartier: 'Riviera',
        profession: 'Enseignante',
        maritalStatus: 'single',
        firstVisitDate: new Date('2024-08-15'),
        howHeardAboutChurch: 'Invitée par une collègue de travail',
        prayerRequests: 'Prière pour sa famille et son travail',
        status: 'to_visit',
        assignedMentorId: mentors[0].id,
        createdBy: admin.id
      }
    }),
    prisma.person.create({
      data: {
        firstName: 'Kouadio',
        lastName: 'BROU',
        gender: 'M',
        dateOfBirth: new Date('1988-11-22'),
        phone: '+225 01 23 45 67 90',
        email: 'kouadio.brou@email.com',
        address: '456 Rue des Palmiers',
        commune: 'Marcory',
        quartier: 'Zone 4',
        profession: 'Comptable',
        maritalStatus: 'married',
        firstVisitDate: new Date('2024-08-10'),
        howHeardAboutChurch: 'Invitation lors d\'un événement d\'évangélisation',
        prayerRequests: 'Bénédiction sur son entreprise',
        status: 'in_follow_up',
        assignedMentorId: mentors[1].id,
        createdBy: admin.id
      }
    }),
    prisma.person.create({
      data: {
        firstName: 'Adjoa',
        lastName: 'MENSAH',
        gender: 'F',
        dateOfBirth: new Date('1992-07-08'),
        phone: '+225 01 23 45 67 91',
        commune: 'Yopougon',
        quartier: 'Selmer',
        profession: 'Commerçante',
        maritalStatus: 'divorced',
        firstVisitDate: new Date('2024-07-28'),
        howHeardAboutChurch: 'Réseaux sociaux - Page Facebook de l\'église',
        prayerRequests: 'Prière pour ses enfants et stabilité financière',
        status: 'integrated',
        assignedMentorId: mentors[2].id,
        createdBy: admin.id
      }
    }),
    prisma.person.create({
      data: {
        firstName: 'Serge',
        lastName: 'KOUAME',
        gender: 'M',
        dateOfBirth: new Date('1985-12-03'),
        phone: '+225 01 23 45 67 92',
        email: 'serge.kouame@email.com',
        commune: 'Abobo',
        quartier: 'Baoulé',
        profession: 'Chauffeur',
        maritalStatus: 'married',
        firstVisitDate: new Date('2024-08-20'),
        howHeardAboutChurch: 'Voisin membre de l\'église',
        status: 'to_visit',
        assignedMentorId: mentors[3].id,
        createdBy: admin.id
      }
    })
  ]);

  // 9. Création suivis de test
  console.log('📋 Création suivis de test...');
  await Promise.all([
    // Suivi pour Kouadio (in_follow_up)
    prisma.followUp.create({
      data: {
        personId: visitors[1].id,
        mentorId: mentors[1].id,
        interactionType: 'call',
        interactionDate: new Date('2024-08-12'),
        notes: 'Premier contact téléphonique très positif. Famille accueillante.',
        outcome: 'positive',
        nextActionNeeded: true,
        nextActionDate: new Date('2024-08-19'),
        nextActionNotes: 'Programmer visite à domicile'
      }
    }),
    
    prisma.followUp.create({
      data: {
        personId: visitors[1].id,
        mentorId: mentors[1].id,
        interactionType: 'visit',
        interactionDate: new Date('2024-08-19'),
        notes: 'Visite à domicile réussie. A participé à l\'étude biblique.',
        outcome: 'positive',
        nextActionNeeded: true,
        nextActionDate: new Date('2024-08-26'),
        nextActionNotes: 'Inviter au service de dimanche'
      }
    }),

    // Suivi pour Adjoa (integrated)
    prisma.followUp.create({
      data: {
        personId: visitors[2].id,
        mentorId: mentors[2].id,
        interactionType: 'meeting',
        interactionDate: new Date('2024-07-30'),
        notes: 'Rencontre à l\'église après le service. Très motivée.',
        outcome: 'positive',
        nextActionNeeded: false
      }
    }),
    
    prisma.followUp.create({
      data: {
        personId: visitors[2].id,
        mentorId: mentors[2].id,
        interactionType: 'call',
        interactionDate: new Date('2024-08-05'),
        notes: 'Suivi téléphonique. Participe régulièrement aux activités.',
        outcome: 'positive',
        nextActionNeeded: false
      }
    })
  ]);

  // 10. Création notifications de test
  console.log('🔔 Création notifications de test...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: mentors[0].id,
        personId: visitors[0].id,
        type: 'new_assignment',
        title: 'Nouvelle attribution',
        message: 'Aminata SANOGO vous a été assignée pour suivi',
        actionUrl: `/persons/${visitors[0].id}`
      }
    }),
    
    prisma.notification.create({
      data: {
        userId: mentors[3].id,
        personId: visitors[3].id,
        type: 'follow_up_reminder',
        title: 'Rappel de suivi',
        message: 'Serge KOUAME attend un premier contact depuis 3 jours',
        actionUrl: `/persons/${visitors[3].id}`
      }
    }),
    
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'status_change',
        title: 'Nouvelle intégration',
        message: 'Adjoa MENSAH a été marquée comme intégrée',
        actionUrl: '/stats/dashboard'
      }
    })
  ]);

  // 11. Statistiques de création
  const stats = {
    users: await prisma.user.count(),
    persons: await prisma.person.count(),
    followUps: await prisma.followUp.count(),
    notifications: await prisma.notification.count(),
    settings: await prisma.setting.count()
  };

  console.log('✅ Seeding terminé avec succès !');
  console.log('📊 Données créées :');
  console.log(`   - ${stats.users} utilisateurs`);
  console.log(`   - ${stats.persons} visiteurs`);
  console.log(`   - ${stats.followUps} suivis`);
  console.log(`   - ${stats.notifications} notifications`);
  console.log(`   - ${stats.settings} paramètres`);
  
  console.log('\n🔑 Comptes créés :');
  console.log('   Admin: admin@ruach.church / admin123');
  console.log('   CAN: accueil1@ruach.church / user123');
  console.log('   CAN: accueil2@ruach.church / user123');
  console.log('   Mentor Jeunes: mentor.jeunes@ruach.church / user123');
  console.log('   Mentor Adultes: mentor.adultes@ruach.church / user123');
  console.log('   Mentor Femmes: mentor.femmes@ruach.church / user123');
  console.log('   Mentor Hommes: mentor.hommes@ruach.church / user123');
  console.log('   Pasteur: pasteur@ruach.church / user123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });