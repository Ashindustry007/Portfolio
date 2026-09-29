
export const siteConfig = {
  name: "Ashish Kumar",
  surname: "Panda",
  tagline: "CAT — Coder | Artist | Traveler",
  intro: "MSCS student at UC San Diego. AI Engineer building the future of intelligent systems through computer vision and agentic architectures.",
  subheadline: "Engineering Intelligence.",
  accentColor: "#FF8000",
  socials: {
    github: "https://github.com/Ashindustry007",
    linkedin: "https://linkedin.com/in/ashishkumar-panda",
    instagram: "https://instagram.com/ash.galleryyy",
    email: "mailto:akpanda@ucsd.edu"
  },
  skills: [
    { id: "#01", label: "AI & Machine Learning" },
    { id: "#02", label: "Computer Vision & LLMs" },
    { id: "#03", label: "Agentic AI & Systems" },
    { id: "#04", label: "Software Engineering" }
  ],
  framesCount: 192,
  framesBaseUrl: "/sequence/frame_",
  framesSuffix: "_delay-0.042s.png"
};

export const experience = [
  {
    title: "AI Engineer Intern",
    company: "Qualcomm",
    description: "Built a WebSocket bridge letting LLMs control pre-silicon chip-design tools via Chrome Extensions. Engineered a Dockerized FastAPI + LangGraph backend with RAG, streaming 4 LLMs over SSE, secured by human-in-the-loop guardrails."
  },
  {
    title: "AI Research Intern",
    company: "Boolean Lab - UCSD Health",
    description: "Engineered self-supervised PyTorch pipelines for colon tissue analysis using Spatial Transcriptomics. Fine-tuned DINOv3-7B Transformers using LoRA, reducing memory by 75% while achieving 81% mIoU in tissue segmentation."
  },
  {
    title: "Software Engineer",
    company: "Open Financial Technologies",
    description: "Deployed Multi-modal AI models boosting extraction accuracy by 18% for automated invoice conversion (92% success). Engineered secure fintech solutions protecting 50K+ users with RBI-compliant risk controls."
  },
  {
    title: "Deep Learning Research Intern",
    company: "Pucho Digital Healthcare",
    description: "Accelerated mRNA vaccine screening via deep learning pipelines. Implemented Explainable AI (XAI) for cell anomaly detection in MRI scans, achieving 96.55% sensitivity for clinical decision support."
  },
  {
    title: "Data Science Intern",
    company: "Analytics Labs",
    description: "Designed hybrid deep learning models for COVID-19 spread prediction with 89% forecast accuracy. Mitigated financial fraud using Genetic Algorithms and Scikit-Learn (98.5% recall)."
  }
];

type Project = {
  title: string;
  description: string;
  imageKey: string;
  link?: string;
  award?: string;
};

export const projects: Project[] = [
  {
    title: "Allerion",
    description: "AI-powered, species-specific pollen forecasting that fuses iNaturalist citizen-science data, the Google Pollen API and a phenology engine into 14-day, neighborhood-level forecasts, with Gemini 2.5 Flash agents for advisories and photo-based plant ID.",
    imageKey: "project-allerion",
    link: "https://github.com/Ashindustry007/DataHacks26-Allerion",
    award: "GDG Challenge Winner · DataHacks 2026"
  },
  {
    title: "LRTSG: Language Reasoning with Scene Graphs",
    description: "Zero-shot agentic VLM pipeline where six agents plan, narrate, build, localize, audit and answer over a verified Scene Graph, cutting reasoning errors from 85% to 10% across 20 complex VQA scenes.",
    imageKey: "project-lrtsg",
    link: "https://github.com/Ashindustry007/LRTSG---Language-Reasoning-Task-with-Scene-Graph"
  },
  {
    title: "SAFE: Smart Analytics for Fire Emergencies",
    description: "Wildfire intelligence platform simulating fire spread with the Rothermel model on 3D terrain, plus an LLM assistant with multi-provider failover (Groq, Gemini, OpenAI, Mistral). Built with React Three Fiber, Node.js and LangChain.",
    imageKey: "project-safe",
    link: "https://github.com/Ashindustry007/SAFE"
  },
  {
    title: "Non-Invasive Vocal Bio-Marker",
    description: "Created a hybrid CRNN-Attention model for non-invasive COVID-19 screening with 97% accuracy using spectral feature extraction and Bidirectional LSTMs.",
    imageKey: "project-vocal",
    link: "https://github.com/Ashindustry007/Vocal-Biomarker-ICBHI-final-database"
  },
  {
    title: "Retinal Vessel Segmentation",
    description: "Developed a Residual U-Net model for early detection of diabetic retinopathy, achieving an AUC of 0.9667 using Python, Keras, and OpenCV.",
    imageKey: "project-retinal",
    link: "https://github.com/Ashindustry007/Retina_Image_Segmentation"
  },
  {
    title: "MusicNet",
    description: "Beethoven-style classical music generation using an LSTM sequence model with embeddings, trained on 157 MIDI pieces across 130 note classes and rendered back to audio with music21.",
    imageKey: "project-musicnet",
    link: "https://github.com/Ashindustry007/MusicNet"
  },
  {
    title: "Population Growth Prediction",
    description: "Built a deep learning pipeline to predict exponential growth rates from genetic data, benchmarking ANNs against Deep Transformer and MultiTask Learning architectures.",
    imageKey: "project-population"
  }
];

export const publications = [
  {
    title: "Odia Handwritten Numeral Recognition: A Hybrid Modelling Approach",
    authors: "A. K. Panda, S. Dash, A. Kuanar, D. Behera and B. Panda",
    conference: "2021 5th International Conference on Electronics, Communication and Aerospace Technology (ICECA)",
    doi: "10.1109/ICECA52323.2021.9675980"
  }
];

export const academicData = {
  graduate: {
    university: "University of California, San Diego (UCSD)",
    degree: "Master of Science (M.S.)",
    branch: "Computer Science",
    cgpa: "3.67",
    terms: [
      {
        id: "Fall 2025",
        gpa: "3.700",
        courses: [
          "CSE 202: Algorithm Design and Analysis",
          "CSE 250A: Probabilistic Reason & Learning",
          "CSE 258: Recommender Sys & Web Mining"
        ]
      },
      {
        id: "Winter 2026",
        gpa: "3.333",
        courses: [
          "CSE 220: Operating Systems Principles",
          "CSE 280A: Algorithms/Computational Biol",
          "CSE 291A: Topics in AI: AI Agents"
        ]
      },
      {
        id: "Spring 2026",
        gpa: "TBD",
        courses: [
          "CSE 252D: Advanced Computer Vision",
          "DSC 270 - Interpretable & Explainable ML",
          "DSC 291 - Trustworthy Machine Learning"
        ]
      }
    ]
  },
  undergraduate: {
    university: "Odisha University of Technology and Research (OUTR)",
    degree: "Bachelor of Technology (B.Tech)",
    branch: "Electrical Engineering",
    cgpa: "9.40",
    semesters: [
      {
        id: "SE01",
        sgpa: "8.06",
        courses: ["Mathematics-I", "Physics", "Basic Electrical Engineering", "Basic Manufacturing Process"]
      },
      {
        id: "SE02",
        sgpa: "9.85",
        courses: ["Chemistry", "Mathematics-II", "Programming for Problem Solving", "English"]
      },
      {
        id: "SE03",
        sgpa: "9.63",
        courses: ["Mathematics-III", "Engineering Economics", "Electrical Circuit Analysis", "Electrical Machines-I"]
      },
      {
        id: "SE04",
        sgpa: "9.71",
        courses: ["Signal and Systems", "Organizational Behaviour", "Electrical Machines-II", "Digital System Design"]
      },
      {
        id: "SE05",
        sgpa: "9.80",
        courses: ["Artificial Intelligence", "Power Transmission and Distribution", "Power Electronics", "Control System-I"]
      },
      {
        id: "SE06",
        sgpa: "9.68",
        courses: ["Object Oriented Programming with C++", "Power System Operation", "Digital Signal Processing", "Renewable Energy"]
      },
      {
        id: "SE07",
        sgpa: "9.10",
        courses: ["Machine Learning", "Power System Protection", "Control Systems-II", "Minor Project Course"]
      },
      {
        id: "SE08",
        sgpa: "9.06",
        courses: ["Major Project Course", "Comprehensive Viva Voce"]
      }
    ]
  },
  additionalCourses: [
    {
      title: "Deep Learning Specialization",
      provider: "Coursera - Deeplearning.ai",
      date: "Jan 2021",
      description: "Neural Networks, Hyperparameter Tuning, CNNs, Sequence Models"
    },
    {
      title: "Mathematics for Machine Learning",
      provider: "Coursera - Imperial College London",
      date: "Dec 2022",
      description: "Linear Algebra, Multivariate Calculus, PCA"
    },
    {
      title: "Fundamentals of Reinforcement Learning",
      provider: "Coursera - University of Alberta",
      date: "Jul 2021"
    },
    {
      title: "Algorithmic Toolbox",
      provider: "Coursera - UCSD & HSE",
      date: "Sept 2020"
    },
    {
      title: "Mathematical Thinking in Computer Science",
      provider: "Coursera - UCSD & HSE",
      date: "Sept 2020"
    },
    {
      title: "Python for Data Science & ML Bootcamp",
      provider: "Udemy",
      date: "Jun 2020"
    },
    {
      title: "AWS Academy Cloud Foundations",
      provider: "AWS Training & Certification",
      date: "Sept 2021"
    }
  ]
};

export const extracurriculars = [
  {
    category: "Tech & Competitive Programming",
    items: [
      { title: "DataHacks 2026 - GDG Challenge Winner", description: "Won the GDG Challenge at DataHacks 2026, competing against 100+ teams (450+ participants) evaluated by 80+ judges and mentors, with Allerion, an AI-powered, species-specific pollen forecasting system." },
      { title: "TCS Codevita Season 10", description: "Achieved World Rank 96th globally." },
      { title: "AWS Generative AI Hackathon", description: "Ranked among the Top 5, conducted by AWS at Open Financial Technologies." },
      { title: "Kaggle Expert", description: "Ranked as Expert in the Notebook category." },
      { title: "Zairza - Technical Club of OUTR", description: "Core Member (2019-23), actively contributing to technical projects and events." }
    ]
  },
  {
    category: "Arts & Media",
    items: [
      { title: "Photofactory - Media Club of OUTR", description: "Head (2022-23) and Core Member (2019-22), led cinematic photography and media production." },
      { title: "19th State Level Child Art Competition", description: "Awarded in Group-C for best painting by Orissa Lalit Kala Akademi (2011)." },
      { title: "Certified Junior Artist", description: "Certified by Orissa Lalit Kala Akademi (2010)." },
      { title: "Fine Art Training", description: "Trained in Fine Art at the School of Art and Craft affiliated to Lalit Kala Akademi (2010)." },
      { title: "Art Exhibitions", description: "Participated in various group Art Exhibitions (2009-2010)." }
    ]
  },
  {
    category: "Adventure & Community Impact",
    items: [
      { title: "Certified Surfer", description: "Level 1 certification from Aquatic Indica Surf School (2023)." },
      { title: "Go India Charity Foundation", description: "Worked for 1.5 years as a rehabilitation assistant, assisting the blind with daily tasks and mobility support." },
      { title: "Inara NGO Volunteer", description: "Contributed to the clean beach movement and animal welfare initiatives." }
    ]
  }
];
