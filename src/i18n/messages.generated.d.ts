import 'i18next';

declare module 'i18next' {
  interface TranslationSchema {
    Navigation: {
      home: string;
      about: string;
      howItWorks: string;
      ethicsPrivacy: string;
      contact: string;
      status: string;
      compliance: string;
    };
    Common: {
      getStarted: string;
      bookAppointment: string;
      findDoctor: string;
      learnMore: string;
      language: string;
    };
    Auth: {
      login: string;
      register: string;
      forgotPassword: string;
    };
    AuthPages: {
      shared: {
        copyright: string;
        backToLogin: string;
        termsOfService: string;
        privacyPolicy: string;
      };
      login: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          hipaa: string;
          encryption: string;
          systemStatus: string;
          online: string;
        };
        tabs: {
          login: string;
          register: string;
        };
        messages: {
          dismiss: string;
          orContinueWith: string;
          registrationSuccess: string;
          loginFailed: string;
          googleFailed: string;
          googleNoCredential: string;
          loginError: string;
          registrationError: string;
          googleError: string;
          recaptchaRequired: string;
        };
        loginForm: {
          heading: string;
          description: string;
          emailLabel: string;
          emailPlaceholder: string;
          passwordLabel: string;
          passwordPlaceholder: string;
          forgotPassword: string;
          signIn: string;
          signingIn: string;
          securityNote: string;
        };
        registerForm: {
          heading: string;
          description: string;
          fullNameLabel: string;
          fullNamePlaceholder: string;
          emailLabel: string;
          emailPlaceholder: string;
          phoneLabel: string;
          phonePlaceholder: string;
          passwordLabel: string;
          passwordPlaceholder: string;
          confirmPasswordLabel: string;
          confirmPasswordPlaceholder: string;
          agreePrefix: string;
          and: string;
          createAccount: string;
          creatingAccount: string;
          doctorCardTitle: string;
          doctorCardDescription: string;
          registerDoctor: string;
          securityNote: string;
        };
        validation: {
          emailRequired: string;
          invalidEmail: string;
          passwordRequired: string;
          passwordMin: string;
          passwordPattern: string;
          fullNameRequired: string;
          fullNameMin: string;
          phoneRequired: string;
          invalidPhone: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
          agreeTerms: string;
        };
      };
      forgotPassword: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          securityFirst: string;
          protectedRecovery: string;
        };
        form: {
          heading: string;
          description: string;
          emailLabel: string;
          emailPlaceholder: string;
          submit: string;
          submitting: string;
        };
        messages: {
          success: string;
          fallbackError: string;
          securityNote: string;
        };
        validation: {
          emailRequired: string;
          invalidEmail: string;
        };
      };
      resetPassword: {
        leftPanel: {
          titleLine1: string;
          titleHighlight: string;
          description: string;
          protectedAccount: string;
          strongCredentials: string;
        };
        form: {
          heading: string;
          description: string;
          newPassword: string;
          confirmNewPassword: string;
          submit: string;
          submitting: string;
        };
        messages: {
          invalidLink: string;
          success: string;
          failed: string;
          missingToken: string;
          goToSignIn: string;
          securityNote: string;
        };
        validation: {
          passwordRequired: string;
          passwordMin: string;
          passwordPattern: string;
          confirmPasswordRequired: string;
          passwordMismatch: string;
        };
      };
      confirmEmail: {
        verifying: {
          title: string;
          description: string;
        };
        success: {
          title: string;
          description: string;
          cta: string;
        };
        error: {
          defaultMessage: string;
          title: string;
          resend: string;
        };
        resend: {
          title: string;
          description: string;
          emailLabel: string;
          emailPlaceholder: string;
          button: string;
          successTitle: string;
          successDescription: string;
        };
      };
      pendingApproval: {
        brandSubtitle: string;
        brandDescription: string;
        statusBadge: string;
        title: string;
        primaryMessage: string;
        secondaryMessage: string;
        processingTime: string;
        closing: string;
        infoBox: string;
        goHome: string;
        logout: string;
        footer: string;
      };
    };
    Ophthalmologist: {
      common: {
        doctor: string;
        role: string;
        logout: string;
        cancel: string;
      };
      header: {
        pages: string;
        searchPlaceholder: string;
        toggleTheme: string;
      };
      sidebar: {
        dashboard: string;
        patients: string;
        screenings: string;
        appointments: string;
        schedules: string;
        consultations: string;
        analytics: string;
        contract: string;
        settings: string;
      };
      dashboard: {
        greeting: {
          morning: string;
          afternoon: string;
          evening: string;
        };
        loading: string;
        loadError: string;
        organisationLabel: string;
        defaultOrganisation: string;
        subtitle: string;
        reviewQueue: {
          title: string;
          description: string;
          pendingReviews: string;
          urgentCases: string;
        };
        capacity: {
          title: string;
          description: string;
          completedToday: string;
          openSlotsToday: string;
        };
        operationalSummary: {
          title: string;
          description: string;
        };
      };
      settings: {
        defaults: {
          unknownDoctor: string;
          noBio: string;
        };
        pageTitle: string;
        profile: {
          title: string;
          edit: string;
          loading: string;
          verifiedPractitioner: string;
          memberSince: string;
          email: string;
          phone: string;
          experience: string;
          experienceSuffix: string;
          years: string;
          specialty: string;
          hospital: string;
          address: string;
          bio: string;
        };
        credentials: {
          title: string;
          upload: string;
          issuedBy: string;
          issued: string;
          expires: string;
          status: {
            verified: string;
            pending: string;
            expired: string;
          };
        };
        wallet: {
          title: string;
          availableBalance: string;
          withdrawFunds: string;
          recentTransactions: string;
          loadingTransactions: string;
          noTransactions: string;
          viewAllTransactions: string;
          withdrawalAmount: string;
          minimumWithdrawal: string;
          withdrawalTo: string;
          withdraw: string;
        };
        accountSettings: {
          title: string;
          security: string;
          securityHint: string;
          language: string;
        };
        appearance: {
          title: string;
          darkMode: string;
          currentlyOn: string;
          currentlyOff: string;
        };
        notifications: {
          title: string;
          email: string;
          emailHint: string;
          push: string;
          pushHint: string;
          reminders: string;
          remindersHint: string;
        };
        dangerZone: {
          title: string;
          deactivate: string;
          description: string;
        };
      };
      appointments: {
        title: string;
        subtitle: string;
        loading: string;
        manageSlots: string;
        notScheduled: string;
        invalidDate: string;
        unknownPatient: string;
        onlineConsultation: string;
        inPersonConsultation: string;
        open: string;
        view: string;
        searchPlaceholder: string;
        filterLabel: string;
        filter: {
          all: string;
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
        status: {
          pending: string;
          confirmed: string;
          completed: string;
          cancelled: string;
        };
        stats: {
          today: string;
          upcoming: string;
          completed: string;
          cancelled: string;
        };
        emptyTitle: string;
        emptyAll: string;
        emptyPrefix: string;
        emptySuffix: string;
        toast: {
          missingDoctorIdentity: string;
          cancelReason: string;
          cancelSuccess: string;
          cancelError: string;
        };
      };
      schedules: {
        title: string;
        subtitle: string;
        loading: string;
        addSlot: string;
        today: string;
        noSlots: string;
        cancelSlotTitle: string;
        errorCreateSlot: string;
        stats: {
          thisWeek: string;
          available: string;
          booked: string;
          cancelled: string;
        };
        filter: {
          all: string;
          available: string;
          booked: string;
          past: string;
        };
        modal: {
          title: string;
          date: string;
          startTime: string;
          endTime: string;
          slotType: string;
          costOptional: string;
          createSlot: string;
        };
      };
      consultations: {
        title: string;
        chat: {
          patient: string;
          doctor: string;
          you: string;
          loading: string;
          searchPlaceholder: string;
          stats: {
            all: string;
            open: string;
            upcoming: string;
          };
          emptySearchTitle: string;
          emptySearchSubtitle: string;
          joinMeeting: string;
          joinLocked: string;
          joinAvailableAfter: string;
          canJoinBeforePrefix: string;
          minutes: string;
          meetingEnded: string;
          meetingWindowClosed: string;
          meetingLinkReady: string;
          linkPending: string;
          schedulePending: string;
          confirmCancelSession: string;
          confirmCompleteSession: string;
          cancelReason: string;
          sendError: string;
          complete: string;
          hideSessionOverview: string;
          showSessionOverview: string;
          autoOpenAtSchedule: string;
          opensIn: string;
          savedAsDoctorNote: string;
          deliveredToPatient: string;
          patientPreVisitNote: string;
          patientMessage: string;
          reviewPatientNotes: string;
          noMessagesInSession: string;
          noMessagesYet: string;
          preVisitEmptyDescription: string;
          inProgressEmptyDescription: string;
          completedEmptyDescription: string;
          typeMessage: string;
          encryptionNotice: string;
          characters: string;
          completedReadOnly: string;
          preVisitReadOnly: string;
          selectSession: string;
          selectSessionDescription: string;
          sessionOverview: string;
          appointment: string;
          lastActivity: string;
          consultationFee: string;
          phaseLabel: string;
          conversationGuidance: string;
          guidanceDescription: string;
          phase: {
            preVisit: string;
            inProgress: string;
            completed: string;
            locked: string;
            postVisit: string;
            preVisitDescription: string;
            inProgressDescription: string;
            completedDescription: string;
          };
        };
      };
      patients: {
        title: string;
        subtitle: string;
        loading: string;
        patientPrefix: string;
        notAvailable: string;
        searchPlaceholder: string;
        moreFilters: string;
        empty: string;
        sessionsSuffix: string;
        nextAppointment: string;
        lastCompletedVisit: string;
        upcoming: string;
        completed: string;
        viewDetails: string;
        statusLabel: {
          urgent: string;
          active: string;
          past: string;
        };
        filter: {
          allStatus: string;
          active: string;
          urgent: string;
          pastOnly: string;
        };
        stats: {
          totalPatients: string;
          active: string;
          urgent: string;
          pastOnly: string;
        };
      };
      slotManagement: {
        title: string;
        subtitle: string;
        loading: string;
        newTemplate: string;
        noSlots: string;
        notConfigured: string;
        minutes: string;
        create: string;
        creating: string;
        generate: string;
        generating: string;
        blockReason: string;
        confirmDeleteTemplate: string;
        blockThisSlot: string;
        unblockThisSlot: string;
        stats: {
          totalSlots: string;
          available: string;
          booked: string;
          blocked: string;
        };
        templates: {
          title: string;
          generateSlots: string;
          empty: string;
        };
        legend: {
          available: string;
          reserved: string;
          booked: string;
          blocked: string;
          expired: string;
        };
        modal: {
          createTemplateTitle: string;
          dayOfWeek: string;
          startTime: string;
          endTime: string;
          slotDuration: string;
          slotType: string;
          costVnd: string;
          generateTitle: string;
          generateFromTemplatePrefix: string;
          fromDate: string;
          toDate: string;
        };
        messages: {
          slotBlocked: string;
          slotUnblocked: string;
          templateCreated: string;
          templateDeleted: string;
          generatedPrefix: string;
          generatedSuffix: string;
        };
        errors: {
          onlyOwnBlock: string;
          onlyOwnUnblock: string;
          failedBlock: string;
          failedUnblock: string;
          failedCreateTemplate: string;
          missingGenerateInputs: string;
          failedGenerate: string;
          failedDeleteTemplate: string;
        };
      };
      contract: {
        title: string;
        subtitle: string;
        refresh: string;
        loading: string;
        emptyTitle: string;
        emptyDescription: string;
        contractCode: string;
        signedDate: string;
        contractInfo: string;
        template: string;
        type: string;
        ophthalmologistType: string;
        createdDate: string;
        signer: string;
        fullName: string;
        actions: string;
        viewTemplate: string;
        viewTemplateHint: string;
        downloadTemplate: string;
        downloadTemplateHint: string;
        downloadFailed: string;
        activeTitle: string;
        activeDescription: string;
        status: {
          uploadedPendingApproval: string;
          pendingSignature: string;
          active: string;
          draft: string;
        };
        upload: {
          signedContract: string;
          pdfUploaded: string;
          waitingAdmin: string;
          sentNotice: string;
          openOriginal: string;
          reupload: string;
          cancelReupload: string;
          dropzoneLabel: string;
          selectFile: string;
          dropzoneHint: string;
          preview: string;
          uploadSignedContract: string;
          uploadFailed: string;
          invalidType: string;
          fileTooLarge: string;
          uploadSignedTitle: string;
          uploadSignedDescription: string;
          steps: {
            downloadPrint: string;
            signStamp: string;
            captureUpload: string;
          };
        };
      };
    };
    MedicalTerms: {
      cardiology: string;
      diagnostics: string;
      patientRecords: string;
      retinalScreening: string;
      ophthalmology: string;
    };
    GuestHome: {
      badge: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
    };
    About: {
      heroTitle: string;
      heroDescription: string;
    };
    HowItWorks: {
      hero: {
        badge: string;
        titlePrefix: string;
        titleSuffix: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
      };
      process: {
        badge: string;
        title: string;
        description: string;
      };
      steps: {
        capture: {
          title: string;
          description: string;
        };
        upload: {
          title: string;
          description: string;
        };
        analysis: {
          title: string;
          description: string;
        };
        assessment: {
          title: string;
          description: string;
        };
      };
      ai: {
        badge: string;
        titleLine1: string;
        titleLine2: string;
        description: string;
        tags: {
          deepLearning: string;
          computerVision: string;
          accuracy: string;
        };
      };
      features: {
        tortuosity: {
          title: string;
          description: string;
        };
        avr: {
          title: string;
          description: string;
        };
        microaneurysm: {
          title: string;
          description: string;
        };
      };
      trust: {
        title: string;
        description: string;
        badges: {
          hipaa: string;
          gdpr: string;
          bias: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
        secondary: string;
      };
    };
    Contact: {
      toast: {
        success: string;
        error: string;
      };
      hero: {
        badge: string;
        titlePrefix: string;
        titleSuffix: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
      };
      partnerCard: {
        title: string;
        description: string;
        benefits: {
          volumeLicensing: string;
          whiteLabel: string;
          customIntegrations: string;
        };
      };
      info: {
        badge: string;
        title: string;
        description: string;
        emailSupport: string;
        responseTime: string;
        responseTimeValue: string;
        headquarters: string;
      };
      form: {
        title: string;
        description: string;
        contactPerson: string;
        fullName: string;
        role: string;
        workEmail: string;
        workEmailPlaceholder: string;
        phone: string;
        organizationDetails: string;
        organizationName: string;
        organizationType: string;
        organizationTypeClinic: string;
        organizationTypeHospital: string;
        cityLocation: string;
        partnershipNeeds: string;
        estimatedMonthlyScreenings: string;
        selectRange: string;
        additionalInformation: string;
        additionalInfoPlaceholder: string;
        termsPrefix: string;
        termsOfService: string;
        and: string;
        privacyPolicy: string;
        sending: string;
        send: string;
      };
      impact: {
        title: string;
        description: string;
        partnerClinics: string;
        screeningsPerformed: string;
        countriesReached: string;
        freeForNonProfits: string;
      };
      faq: {
        title: string;
        items: {
          cost: {
            question: string;
            answer: string;
          };
          onboarding: {
            question: string;
            answer: string;
          };
        };
      };
    };
    Status: {
      labels: {
        operational: string;
        outage: string;
        degraded: string;
        checking: string;
      };
      time: {
        justNow: string;
        secondsAgo_one: string;
        secondsAgo_other: string;
        minutesAgo_one: string;
        minutesAgo_other: string;
      };
      overall: {
        allOperational: string;
        partialOutage: string;
        majorOutage: string;
        checkingSystems: string;
      };
      hero: {
        title: string;
        description: string;
        lastUpdated: string;
        refresh: string;
      };
      metrics: {
        totalScreenings: string;
        totalScreeningsTrend: string;
        aiModelVersion: string;
        fdaCleared: string;
        avgProcessing: string;
        avgProcessingDetail: string;
      };
      componentStatus: {
        title: string;
        serviceName: string;
        region: string;
        status: string;
      };
      services: {
        aiCore: {
          name: string;
          description: string;
        };
        imageApi: {
          name: string;
          description: string;
        };
        providerPortal: {
          name: string;
          description: string;
        };
        patientStore: {
          name: string;
          description: string;
        };
      };
      trust: {
        title: string;
        cards: {
          bias: {
            title: string;
            description: string;
            cta: string;
          };
          privacy: {
            title: string;
            description: string;
            cta: string;
          };
          validation: {
            title: string;
            description: string;
            cta: string;
          };
        };
      };
    };
    Home: {
      hero: {
        badge: string;
        titlePrefix: string;
        titleHighlight: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        socialProof: string;
        analysisResult: string;
        lowRisk: string;
        confidenceScore: string;
      };
      features: {
        title: string;
        description: string;
        cards: {
          aiPrecision: {
            title: string;
            description: string;
          };
          globalAccess: {
            title: string;
            description: string;
          };
          privacyFirst: {
            title: string;
            description: string;
          };
        };
      };
      workflow: {
        badge: string;
        title: string;
        steps: {
          upload: {
            title: string;
            description: string;
          };
          analysis: {
            title: string;
            description: string;
          };
          report: {
            title: string;
            description: string;
          };
        };
      };
      mission: {
        title: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        info: {
          nonProfitTitle: string;
          nonProfitDescription: string;
          openSourceTitle: string;
          openSourceDescription: string;
        };
      };
      stats: {
        scansAnalyzed: string;
        accuracyRate: string;
        countriesReached: string;
        nonProfit: string;
      };
    };
    EthicsPrivacy: {
      hero: {
        badge: string;
        titleLine1: string;
        titleLine2: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        secureEnclave: string;
        processingNode: string;
      };
      compliance: {
        title: string;
      };
      pillarsSection: {
        title: string;
        description: string;
      };
      pillars: {
        privacy: {
          title: string;
          description: string;
        };
        ethicalAi: {
          title: string;
          description: string;
        };
        transparency: {
          title: string;
          description: string;
        };
      };
      journey: {
        title: string;
        description: string;
        link: string;
      };
      dataJourney: {
        upload: {
          title: string;
          description: string;
        };
        anonymization: {
          title: string;
          description: string;
        };
        analysis: {
          title: string;
          description: string;
        };
        delivery: {
          title: string;
          description: string;
        };
      };
      faq: {
        title: string;
        description: string;
        datasets: {
          question: string;
          answer: string;
        };
        humanLoop: {
          question: string;
          answer: string;
        };
        edgeCases: {
          question: string;
          answer: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
        secondary: string;
      };
    };
    Compliance: {
      hero: {
        titlePrefix: string;
        titleHighlight: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
      };
      certifications: {
        title: string;
        description: string;
      };
      security: {
        title: string;
        description: string;
        encryption: {
          title: string;
          description: string;
        };
        mfa: {
          title: string;
          description: string;
        };
        auditLogs: {
          title: string;
          description: string;
        };
        backups: {
          title: string;
          description: string;
        };
        uptime: {
          title: string;
          description: string;
        };
        rbac: {
          title: string;
          description: string;
        };
      };
      audits: {
        title: string;
        description: string;
        completed: string;
        soc2: {
          date: string;
          event: string;
          details: string;
        };
        hipaa: {
          date: string;
          event: string;
          details: string;
        };
        iso: {
          date: string;
          event: string;
          details: string;
        };
        pentest: {
          date: string;
          event: string;
          details: string;
        };
      };
      cta: {
        title: string;
        description: string;
        primary: string;
        secondary: string;
      };
    };
    PatientReview: {
      status: {
        healthy: string;
        low: string;
        moderate: string;
        high: string;
      };
      summary: {
        healthy: string;
        low: string;
        moderate: string;
        high: string;
      };
      findingsDetected: string;
      backToDashboard: string;
      sessionLabel: string;
    };
  }

  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}
