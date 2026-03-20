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
  }

  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: TranslationSchema;
    };
  }
}
