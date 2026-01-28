import React, { useState } from 'react';
import styles from './ResumeSkills.module.css';

// Expanded MOS/AFSC/Rating to skills mapping
export const MOS_SKILLS: Record<string, string[]> = {
  '11B': [
    'Infantry tactics',
    'Team leadership',
    'Weapons proficiency',
    'Field operations',
    'Physical fitness',
    'Mission planning',
    'Security operations',
    'Training and mentoring',
    'Emergency response',
    'Adaptability in high-stress environments',
    'Land navigation',
    'Reconnaissance',
    'Small unit leadership',
    'Risk assessment',
    'Logistics coordination',
    'Cross-functional team collaboration',
    'After-action reporting',
    'Equipment maintenance',
    'Conflict resolution',
    'Time management',
  ],
  '68W': [
    'Combat medical care',
    'Patient assessment',
    'Trauma management',
    'Medical evacuation',
    'CPR and first aid',
    'Medical documentation',
    'Teamwork under pressure',
    'Field sanitation',
    'Medical supply management',
    'Instruction and training',
    'Patient triage',
    'Health education',
    'Infection control',
    'Emergency preparedness',
    'Medical logistics',
    'Critical thinking',
    'Care under fire',
    'Patient advocacy',
    'Interpersonal communication',
    'Adaptability',
  ],
  '3D1X2': [
    'Cyber systems operations',
    'Network administration',
    'Information security',
    'Troubleshooting',
    'System upgrades',
    'Technical documentation',
    'Incident response',
    'User support',
    'IT project management',
    'Training end users',
    'Server management',
    'Cloud computing',
    'Vulnerability assessment',
    'Disaster recovery',
    'Configuration management',
    'Process improvement',
    'Change management',
    'Root cause analysis',
    'Automation scripting',
    'Cross-team communication',
  ],
  '0311': [
    'Rifle marksmanship',
    'Patrol operations',
    'Amphibious operations',
    'Urban combat',
    'Fire team leadership',
    'Tactical planning',
    'Physical endurance',
    'Weapons maintenance',
    'Situational awareness',
    'Team cohesion',
    'Mission execution',
    'Field fortification',
    'Radio communication',
    'Survival skills',
    'First responder',
    'Mentoring junior Marines',
    'Operational security',
    'Adaptability',
    'Stress management',
    'Problem solving',
  ],
  'AFSC 1N0X1': [
    'Intelligence analysis',
    'Briefing senior leaders',
    'Data synthesis',
    'Threat assessment',
    'Report writing',
    'Geospatial analysis',
    'Critical thinking',
    'Research',
    'Security clearance',
    'Collaboration with agencies',
    'Information dissemination',
    'Collection management',
    'Mission support',
    'Presentation skills',
    'Time-sensitive analysis',
    'Database management',
    'Open-source intelligence',
    'Risk mitigation',
    'Training and instruction',
    'Attention to detail',
  ],
  'BM': [
    'Boat operations',
    'Navigation',
    'Search and rescue',
    'Maritime law enforcement',
    'Small boat handling',
    'Damage control',
    'Leadership',
    'Team training',
    'Safety compliance',
    'Maintenance',
    'Radio operation',
    'Emergency response',
    'Survival at sea',
    'Firefighting',
    'First aid',
    'Mission planning',
    'Crew management',
    'Public relations',
    'Adaptability',
    'Problem solving',
  ],
  // ARMY MOS - Comprehensive Coverage
  '11C': ['Indirect fire infantryman', 'Mortar operations', 'Fire direction', 'Ballistics', 'Target acquisition', 'Fire support coordination', 'Tactical planning', 'Team leadership', 'Equipment maintenance', 'Safety protocols'],
  '12B': ['Combat engineering', 'Demolitions', 'Construction', 'Mine detection', 'Route clearance', 'Bridge building', 'Obstacle emplacement', 'Blueprint reading', 'Heavy equipment operation', 'Safety management'],
  '13B': ['Field artillery', 'Howitzer operations', 'Fire direction', 'Ballistics', 'Target acquisition', 'Fire mission processing', 'Ammunition handling', 'Crew coordination', 'Precision targeting', 'Equipment maintenance'],
  '13F': ['Fire support specialist', 'Forward observer', 'Joint fires', 'Close air support coordination', 'Artillery coordination', 'Target identification', 'Digital fire control', 'Communication systems', 'Mission planning', 'Situational awareness'],
  '15P': ['Aviation operations specialist', 'Air traffic control', 'Flight planning', 'Weather analysis', 'Mission coordination', 'Airspace management', 'Communication protocols', 'Safety regulations', 'Record keeping', 'Multi-tasking'],
  '15T': ['Blackhawk helicopter repairer', 'Aviation maintenance', 'Troubleshooting', 'Technical manuals', 'Quality control', 'Safety inspections', 'Component replacement', 'Diagnostic testing', 'Documentation', 'Tool management'],
  '18B': ['Special Forces weapons sergeant', 'Advanced marksmanship', 'Foreign weapons', 'Demolitions', 'Tactical planning', 'Small unit tactics', 'Cultural awareness', 'Language skills', 'Training foreign forces', 'Mission planning'],
  '18C': ['Special Forces engineer sergeant', 'Demolitions expert', 'Construction', 'Obstacle reduction', 'Infrastructure assessment', 'Civil engineering', 'Training foreign forces', 'Mission planning', 'Cultural awareness', 'Language skills'],
  '18D': ['Special Forces medical sergeant', 'Advanced trauma care', 'Field surgery', 'Preventive medicine', 'Veterinary care', 'Dental procedures', 'Public health', 'Training foreign forces', 'Cultural awareness', 'Language skills'],
  '18E': ['Special Forces communications sergeant', 'Advanced communications', 'Satellite systems', 'Encryption', 'Signal intelligence', 'Network operations', 'Training foreign forces', 'Cultural awareness', 'Language skills', 'Mission planning'],
  '19D': ['Cavalry scout', 'Reconnaissance', 'Surveillance', 'Target acquisition', 'Vehicle operations', 'Navigation', 'Communication', 'Tactical reporting', 'Weapons proficiency', 'Situational awareness'],
  '25B': ['Information technology specialist', 'Network administration', 'Server management', 'Help desk support', 'Troubleshooting', 'Security protocols', 'Software installation', 'User training', 'Documentation', 'System updates'],
  '25N': ['Nodal network systems operator', 'Satellite communications', 'Network configuration', 'Signal operations', 'Troubleshooting', 'Equipment setup', 'Security procedures', 'Technical documentation', 'Quality control', 'Team coordination'],
  '25S': ['Satellite communication systems operator', 'Satellite operations', 'Signal transmission', 'Equipment maintenance', 'Troubleshooting', 'Network configuration', 'Security protocols', 'Technical documentation', 'Team coordination', 'Mission support'],
  '25U': ['Signal support systems specialist', 'Radio operations', 'Network setup', 'Troubleshooting', 'Equipment maintenance', 'Communication security', 'Documentation', 'User support', 'Quality control', 'Team coordination'],
  '31B': ['Military police', 'Law enforcement', 'Security operations', 'Traffic control', 'Investigations', 'Detention operations', 'Patrol procedures', 'Use of force', 'Report writing', 'Community relations'],
  '35F': ['Intelligence analyst', 'All-source intelligence', 'Data analysis', 'Briefing preparation', 'Intelligence reporting', 'Threat assessment', 'Database management', 'Research', 'Critical thinking', 'Presentation skills'],
  '35M': ['Human intelligence collector', 'Interrogation', 'Debriefing', 'Screening', 'Source operations', 'Intelligence reporting', 'Cultural awareness', 'Language skills', 'Critical thinking', 'Communication skills'],
  '35N': ['Signals intelligence analyst', 'Signal collection', 'Traffic analysis', 'Electronic warfare', 'Technical analysis', 'Reporting', 'Database management', 'Communication intercept', 'Threat assessment', 'Analytical tools'],
  '35P': ['Cryptologic linguist', 'Foreign language', 'Translation', 'Interpretation', 'Signal intelligence', 'Voice intercept', 'Transcription', 'Cultural awareness', 'Reporting', 'Communication analysis'],
  '35S': ['Signals collector/analyst', 'Signal collection', 'Electronic warfare', 'Technical analysis', 'Equipment operation', 'Data processing', 'Reporting', 'Threat assessment', 'Communication systems', 'Analytical skills'],
  '36B': ['Financial management technician', 'Accounting', 'Budgeting', 'Payroll processing', 'Financial reporting', 'Auditing', 'Data entry', 'Customer service', 'Regulations compliance', 'Attention to detail'],
  '37F': ['Psychological operations specialist', 'Media production', 'Target audience analysis', 'Information operations', 'Communication strategies', 'Cultural awareness', 'Language skills', 'Multimedia production', 'Research', 'Campaign planning'],
  '38B': ['Civil affairs specialist', 'Civil-military operations', 'Community assessment', 'Project management', 'Cultural awareness', 'Language skills', 'Negotiation', 'Coordination', 'Reporting', 'Relationship building'],
  '42A': ['Human resources specialist', 'Personnel management', 'Record keeping', 'Customer service', 'Data entry', 'Regulations compliance', 'Counseling', 'Promotions processing', 'Awards preparation', 'Organizational skills'],
  '68A': ['Biomedical equipment specialist', 'Medical equipment maintenance', 'Troubleshooting', 'Calibration', 'Technical documentation', 'Safety inspections', 'Quality control', 'Customer service', 'Preventive maintenance', 'Parts management'],
  '68C': ['Licensed practical nurse', 'Patient care', 'Medication administration', 'Vital signs monitoring', 'Medical documentation', 'Wound care', 'IV therapy', 'Patient education', 'Clinical procedures', 'Team collaboration'],
  '68P': ['Radiology specialist', 'X-ray operations', 'Radiation safety', 'Patient positioning', 'Image quality', 'Equipment maintenance', 'Medical documentation', 'Patient care', 'Technical procedures', 'Quality control'],
  '68X': ['Behavioral health specialist', 'Mental health counseling', 'Crisis intervention', 'Patient assessment', 'Treatment planning', 'Group therapy', 'Medical documentation', 'Confidentiality', 'Case management', 'Therapeutic communication'],
  '74D': ['Chemical operations specialist', 'CBRN defense', 'Decontamination', 'Detection equipment', 'Hazard assessment', 'Safety procedures', 'Equipment maintenance', 'Training', 'Emergency response', 'Technical documentation'],
  '88M': ['Motor transport operator', 'Commercial driving', 'Vehicle operation', 'Route planning', 'Load securement', 'Vehicle maintenance', 'Safety procedures', 'Convoy operations', 'Documentation', 'Time management'],
  '88N': ['Transportation management coordinator', 'Logistics coordination', 'Movement planning', 'Documentation', 'Customer service', 'Regulations compliance', 'Data management', 'Problem solving', 'Communication', 'Organizational skills'],
  '89B': ['Ammunition specialist', 'Munitions handling', 'Storage procedures', 'Safety protocols', 'Inventory management', 'Quality control', 'Transportation', 'Documentation', 'Hazardous materials', 'Team coordination'],
  '91B': ['Wheeled vehicle mechanic', 'Vehicle maintenance', 'Diagnostics', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Parts management', 'Quality control', 'Safety procedures', 'Tool operation'],
  '91D': ['Power generation equipment repairer', 'Generator maintenance', 'Electrical systems', 'Troubleshooting', 'Repair procedures', 'Preventive maintenance', 'Technical documentation', 'Safety procedures', 'Quality control', 'Parts management'],
  '91F': ['Small arms/artillery repairer', 'Weapons maintenance', 'Troubleshooting', 'Repair procedures', 'Quality control', 'Technical manuals', 'Parts management', 'Safety procedures', 'Precision work', 'Tool operation'],
  '92A': ['Automated logistical specialist', 'Supply chain management', 'Inventory control', 'Warehouse operations', 'Documentation', 'Data entry', 'Customer service', 'Regulations compliance', 'Organization', 'Attention to detail'],
  '92F': ['Petroleum supply specialist', 'Fuel operations', 'Storage procedures', 'Quality testing', 'Safety protocols', 'Distribution', 'Equipment operation', 'Documentation', 'Hazardous materials', 'Inventory management'],
  '92G': ['Culinary specialist', 'Food preparation', 'Menu planning', 'Sanitation', 'Inventory management', 'Nutrition', 'Food safety', 'Equipment operation', 'Team leadership', 'Customer service'],
  '92Y': ['Unit supply specialist', 'Supply operations', 'Inventory management', 'Documentation', 'Property accountability', 'Customer service', 'Warehouse operations', 'Data entry', 'Regulations compliance', 'Organization'],

  // AIR FORCE AFSC - Comprehensive Coverage
  '1N0X1': ['Intelligence analysis', 'Briefing senior leaders', 'Data synthesis', 'Threat assessment', 'Report writing', 'Geospatial analysis', 'Critical thinking', 'Research', 'Security clearance', 'Database management'],
  '1N1X1': ['Geospatial intelligence', 'Imagery analysis', 'Target identification', 'Mapping', 'GIS software', 'Intelligence reporting', 'Database management', 'Technical analysis', 'Presentation skills', 'Attention to detail'],
  '2A3X3': ['Tactical aircraft maintenance', 'Troubleshooting', 'Technical manuals', 'Quality control', 'Safety inspections', 'Component replacement', 'Diagnostic testing', 'Documentation', 'Tool management', 'Preventive maintenance'],
  '2A6X1': ['Aerospace propulsion', 'Engine maintenance', 'Troubleshooting', 'Technical manuals', 'Quality control', 'Safety procedures', 'Component testing', 'Documentation', 'Tool management', 'Preventive maintenance'],
  '2A7X1': ['Aircraft metals technology', 'Welding', 'Fabrication', 'Sheet metal work', 'Blueprint reading', 'Quality control', 'Precision measurement', 'Safety procedures', 'Tool operation', 'Documentation'],
  '2T2X1': ['Air transportation', 'Cargo operations', 'Load planning', 'Aircraft loading', 'Documentation', 'Safety procedures', 'Customer service', 'Equipment operation', 'Team coordination', 'Time management'],
  '3D0X2': ['Cyber systems operations', 'Network administration', 'Server management', 'Troubleshooting', 'Security protocols', 'User support', 'Documentation', 'System configuration', 'Incident response', 'Quality control'],
  '3D0X3': ['Cyber surety', 'Information security', 'Risk assessment', 'Security protocols', 'Compliance auditing', 'Policy development', 'Incident response', 'Documentation', 'User training', 'Vulnerability assessment'],
  '3D1X2': ['Cyber transport systems', 'Network configuration', 'Troubleshooting', 'Cable installation', 'Equipment maintenance', 'Documentation', 'Security procedures', 'User support', 'Quality control', 'Team coordination'],
  '3E0X1': ['Electrical systems', 'Installation', 'Troubleshooting', 'Maintenance', 'Blueprint reading', 'Safety procedures', 'Testing equipment', 'Documentation', 'Quality control', 'Team coordination'],
  '3E2X1': ['Pavement and construction equipment', 'Heavy equipment operation', 'Construction', 'Maintenance', 'Safety procedures', 'Blueprint reading', 'Project coordination', 'Quality control', 'Documentation', 'Team leadership'],
  '3E3X1': ['Structural engineering', 'Construction', 'Carpentry', 'Plumbing', 'Masonry', 'Blueprint reading', 'Safety procedures', 'Quality control', 'Project coordination', 'Documentation'],
  '3E4X1': ['Water and fuel systems maintenance', 'Plumbing', 'System installation', 'Troubleshooting', 'Maintenance', 'Safety procedures', 'Quality control', 'Documentation', 'Environmental compliance', 'Team coordination'],
  '3E7X1': ['Fire protection', 'Emergency response', 'Firefighting', 'Hazmat operations', 'Rescue operations', 'Safety procedures', 'Equipment maintenance', 'Training', 'Documentation', 'Team coordination'],
  '4A0X1': ['Health services management', 'Medical administration', 'Patient services', 'Medical records', 'Scheduling', 'Customer service', 'Regulations compliance', 'Data entry', 'Communication', 'Organization'],
  '4N0X1': ['Aerospace medical service', 'Patient care', 'Medical procedures', 'Emergency response', 'Medical documentation', 'Equipment operation', 'Infection control', 'Patient education', 'Team collaboration', 'Clinical skills'],
  '6C0X1': ['Contracting', 'Procurement', 'Contract negotiation', 'Vendor management', 'Cost analysis', 'Regulations compliance', 'Documentation', 'Communication', 'Problem solving', 'Analytical skills'],
  '6F0X1': ['Financial management', 'Accounting', 'Budgeting', 'Financial reporting', 'Auditing', 'Data analysis', 'Regulations compliance', 'Customer service', 'Attention to detail', 'Problem solving'],

  // NAVY RATINGS - Comprehensive Coverage
  'ABE': ['Aviation boatswain's mate - equipment', 'Aircraft handling', 'Catapult operations', 'Arresting gear', 'Safety procedures', 'Equipment maintenance', 'Team coordination', 'Communication', 'Quality control', 'Emergency response'],
  'ABH': ['Aviation boatswain's mate - handling', 'Aircraft handling', 'Flight deck operations', 'Safety procedures', 'Equipment operation', 'Team coordination', 'Communication', 'Fire prevention', 'Emergency response', 'Leadership'],
  'AC': ['Air traffic controller', 'Air traffic control', 'Radar operations', 'Communication', 'Safety procedures', 'Mission coordination', 'Weather monitoring', 'Emergency procedures', 'Multi-tasking', 'Stress management'],
  'AD': ['Aviation machinist's mate', 'Aircraft maintenance', 'Engine repair', 'Troubleshooting', 'Technical manuals', 'Quality control', 'Safety procedures', 'Tool operation', 'Documentation', 'Team coordination'],
  'AE': ['Aviation electrician's mate', 'Electrical systems', 'Avionics', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Precision work'],
  'AG': ['Aerographer's mate', 'Meteorology', 'Weather forecasting', 'Data analysis', 'Oceanography', 'Computer systems', 'Briefing preparation', 'Technical writing', 'Research', 'Communication'],
  'AM': ['Aviation structural mechanic', 'Aircraft maintenance', 'Sheet metal work', 'Welding', 'Fabrication', 'Quality control', 'Technical manuals', 'Safety procedures', 'Precision work', 'Documentation'],
  'AO': ['Aviation ordnanceman', 'Weapons systems', 'Munitions handling', 'Safety procedures', 'Quality control', 'Equipment maintenance', 'Technical procedures', 'Documentation', 'Team coordination', 'Attention to detail'],
  'AT': ['Aviation electronics technician', 'Avionics systems', 'Radar', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Precision work'],
  'AW': ['Naval aircrewman', 'Flight operations', 'Search and rescue', 'Sensor operations', 'Navigation', 'Communication', 'Emergency procedures', 'Team coordination', 'Mission planning', 'Physical fitness'],
  'BM': ['Boatswain's mate', 'Boat operations', 'Navigation', 'Seamanship', 'Deck operations', 'Cargo handling', 'Safety procedures', 'Leadership', 'Team coordination', 'Emergency response'],
  'BU': ['Builder', 'Construction', 'Carpentry', 'Masonry', 'Concrete work', 'Blueprint reading', 'Equipment operation', 'Safety procedures', 'Quality control', 'Project coordination'],
  'CE': ['Construction electrician', 'Electrical installation', 'Troubleshooting', 'Maintenance', 'Blueprint reading', 'Safety procedures', 'Quality control', 'Documentation', 'Team coordination', 'Power distribution'],
  'CM': ['Construction mechanic', 'Equipment maintenance', 'Repair procedures', 'Diagnostics', 'Preventive maintenance', 'Technical manuals', 'Safety procedures', 'Documentation', 'Quality control', 'Tool operation'],
  'CS': ['Culinary specialist', 'Food preparation', 'Menu planning', 'Sanitation', 'Nutrition', 'Inventory management', 'Food safety', 'Customer service', 'Leadership', 'Team coordination'],
  'CTI': ['Cryptologic technician - interpretive', 'Foreign language', 'Translation', 'Interpretation', 'Intelligence analysis', 'Signal intelligence', 'Cultural awareness', 'Transcription', 'Reporting', 'Communication analysis'],
  'CTN': ['Cryptologic technician - networks', 'Cyber operations', 'Network security', 'Incident response', 'Threat analysis', 'Computer forensics', 'Offensive operations', 'Defensive operations', 'Technical analysis', 'Reporting'],
  'CTR': ['Cryptologic technician - collection', 'Signal collection', 'Technical analysis', 'Equipment operation', 'Data processing', 'Electronic warfare', 'Threat assessment', 'Reporting', 'Communication systems', 'Analytical skills'],
  'CTT': ['Cryptologic technician - technical', 'Signal intelligence', 'Technical analysis', 'Equipment operation', 'Electronic warfare', 'Data processing', 'Threat assessment', 'Reporting', 'Communication systems', 'Maintenance'],
  'DC': ['Damage controlman', 'Damage control', 'Firefighting', 'Emergency response', 'Equipment maintenance', 'Training', 'Safety procedures', 'Chemical/biological/radiological defense', 'Documentation', 'Team leadership'],
  'EA': ['Engineering aid', 'Drafting', 'Surveying', 'Blueprint reading', 'Computer-aided design', 'Project planning', 'Quality control', 'Documentation', 'Technical calculations', 'Team coordination'],
  'EM': ['Electrician's mate', 'Electrical systems', 'Power generation', 'Distribution', 'Troubleshooting', 'Maintenance', 'Safety procedures', 'Blueprint reading', 'Documentation', 'Quality control'],
  'EN': ['Engineman', 'Diesel engines', 'Maintenance', 'Troubleshooting', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation'],
  'ET': ['Electronics technician', 'Electronics systems', 'Radar', 'Navigation systems', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Calibration', 'Documentation', 'Quality control'],
  'FC': ['Fire controlman', 'Weapons systems', 'Radar', 'Computer systems', 'Troubleshooting', 'Maintenance', 'Technical procedures', 'Quality control', 'Documentation', 'Team coordination'],
  'GM': ['Gunner's mate', 'Weapons systems', 'Ordnance', 'Maintenance', 'Ballistics', 'Safety procedures', 'Quality control', 'Technical procedures', 'Documentation', 'Team coordination'],
  'HM': ['Hospital corpsman', 'Patient care', 'Medical procedures', 'Emergency response', 'Medical documentation', 'Pharmacy', 'Laboratory procedures', 'Patient education', 'Clinical skills', 'Team collaboration'],
  'HT': ['Hull maintenance technician', 'Welding', 'Pipefitting', 'Plumbing', 'Sheet metal work', 'Damage control', 'Blueprint reading', 'Quality control', 'Safety procedures', 'Equipment operation'],
  'IS': ['Intelligence specialist', 'Intelligence analysis', 'Data collection', 'Briefing preparation', 'Database management', 'Research', 'Reporting', 'Security procedures', 'Presentation skills', 'Critical thinking'],
  'IT': ['Information systems technician', 'Network administration', 'Computer systems', 'Troubleshooting', 'Security procedures', 'User support', 'Documentation', 'Software installation', 'Hardware maintenance', 'Quality control'],
  'LS': ['Logistics specialist', 'Supply chain management', 'Inventory control', 'Procurement', 'Documentation', 'Customer service', 'Data entry', 'Warehouse operations', 'Quality control', 'Organization'],
  'MA': ['Master-at-arms', 'Law enforcement', 'Security', 'Investigations', 'Patrol operations', 'Traffic control', 'Use of force', 'Report writing', 'Community relations', 'Emergency response'],
  'MC': ['Mass communication specialist', 'Photography', 'Videography', 'Journalism', 'Public affairs', 'Multimedia production', 'Editing', 'Social media', 'Communication', 'Creative design'],
  'MM': ['Machinist's mate', 'Engine maintenance', 'Troubleshooting', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety procedures', 'Precision work', 'Documentation'],
  'MN': ['Mineman', 'Mine warfare', 'Ordnance handling', 'Electronics', 'Underwater systems', 'Safety procedures', 'Maintenance', 'Technical procedures', 'Quality control', 'Team coordination'],
  'MR': ['Machinery repairman', 'Machine shop operations', 'Welding', 'Machining', 'Fabrication', 'Blueprint reading', 'Quality control', 'Precision measurement', 'Safety procedures', 'Tool operation'],
  'NC': ['Navy counselor', 'Career counseling', 'Recruiting', 'Personnel management', 'Communication', 'Record keeping', 'Regulations compliance', 'Public speaking', 'Customer service', 'Organizational skills'],
  'ND': ['Navy diver', 'Underwater operations', 'Diving', 'Salvage', 'Construction', 'Demolition', 'Emergency response', 'Equipment maintenance', 'Physical fitness', 'Team coordination'],
  'OS': ['Operations specialist', 'Combat systems', 'Radar operations', 'Surface warfare', 'Communications', 'Navigation', 'Data analysis', 'Watchstanding', 'Team coordination', 'Multi-tasking'],
  'PR': ['Aircrew survival equipmentman', 'Life support equipment', 'Parachutes', 'Survival gear', 'Maintenance', 'Inspection', 'Quality control', 'Safety procedures', 'Documentation', 'Technical procedures'],
  'PS': ['Personnel specialist', 'Human resources', 'Personnel management', 'Record keeping', 'Customer service', 'Data entry', 'Regulations compliance', 'Counseling', 'Communication', 'Organizational skills'],
  'QM': ['Quartermaster', 'Navigation', 'Chart plotting', 'Piloting', 'Seamanship', 'Meteorology', 'Visual communications', 'Bridge operations', 'Safety procedures', 'Watchstanding'],
  'SH': ['Ship's serviceman', 'Retail operations', 'Inventory management', 'Customer service', 'Food service', 'Laundry operations', 'Barbering', 'Money handling', 'Documentation', 'Quality control'],
  'SO': ['Special warfare operator', 'Special operations', 'Advanced tactics', 'Weapons proficiency', 'Physical fitness', 'Leadership', 'Mission planning', 'Combat diving', 'Parachuting', 'Team coordination'],
  'ST': ['Sonar technician', 'Sonar systems', 'Underwater acoustics', 'Signal analysis', 'Equipment operation', 'Maintenance', 'Data processing', 'Technical procedures', 'Quality control', 'Team coordination'],
  'SW': ['Steelworker', 'Welding', 'Structural steel', 'Rigging', 'Fabrication', 'Blueprint reading', 'Quality control', 'Safety procedures', 'Equipment operation', 'Team coordination'],
  'YN': ['Yeoman', 'Office administration', 'Correspondence', 'Record keeping', 'Data entry', 'Customer service', 'Regulations compliance', 'Communication', 'Organizational skills', 'Computer skills'],

  // MARINE CORPS MOS - Comprehensive Coverage
  '0313': ['Light armored reconnaissance', 'Reconnaissance', 'Vehicle operations', 'Surveillance', 'Communications', 'Navigation', 'Tactical reporting', 'Weapons proficiency', 'Team coordination', 'Mission planning'],
  '0321': ['Reconnaissance Marine', 'Special operations', 'Reconnaissance', 'Surveillance', 'Parachuting', 'Diving', 'Advanced tactics', 'Intelligence collection', 'Physical fitness', 'Team coordination'],
  '0331': ['Machine gunner', 'Heavy weapons', 'Crew-served weapons', 'Fire team operations', 'Tactical employment', 'Maintenance', 'Marksmanship', 'Safety procedures', 'Team coordination', 'Leadership'],
  '0341': ['Mortarman', 'Indirect fire', 'Mortar operations', 'Fire direction', 'Ballistics', 'Target acquisition', 'Crew coordination', 'Equipment maintenance', 'Safety procedures', 'Team leadership'],
  '0351': ['Infantry assaultman', 'Demolitions', 'Breaching', 'Rocket systems', 'Fire support', 'Tactical planning', 'Safety procedures', 'Team coordination', 'Weapons proficiency', 'Physical fitness'],
  '0811': ['Field artillery cannoneer', 'Artillery operations', 'Howitzer systems', 'Fire missions', 'Ammunition handling', 'Crew coordination', 'Maintenance', 'Safety procedures', 'Team leadership', 'Precision targeting'],
  '0861': ['Fire support Marine', 'Forward observer', 'Joint fires coordination', 'Artillery coordination', 'Close air support', 'Target identification', 'Communication systems', 'Mission planning', 'Tactical operations', 'Team coordination'],
  '1371': ['Combat engineer', 'Demolitions', 'Construction', 'Mine detection', 'Route clearance', 'Obstacle emplacement', 'Blueprint reading', 'Equipment operation', 'Safety procedures', 'Team leadership'],
  '2111': ['Small arms repairer', 'Weapons maintenance', 'Troubleshooting', 'Repair procedures', 'Quality control', 'Technical manuals', 'Precision work', 'Safety procedures', 'Tool operation', 'Documentation'],
  '2336': ['Explosive ordnance disposal', 'Bomb disposal', 'Hazardous materials', 'Technical procedures', 'Safety protocols', 'Emergency response', 'Risk assessment', 'Documentation', 'Team coordination', 'Critical thinking'],
  '2847': ['Ground radio repairer', 'Communications equipment', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Tool operation', 'Team coordination'],
  '3043': ['Supply administration and operations', 'Supply chain management', 'Inventory control', 'Documentation', 'Customer service', 'Data entry', 'Warehouse operations', 'Regulations compliance', 'Organization', 'Quality control'],
  '3051': ['Warehouse clerk', 'Inventory management', 'Warehouse operations', 'Material handling', 'Documentation', 'Customer service', 'Quality control', 'Organization', 'Data entry', 'Team coordination'],
  '3521': ['Organizational automotive mechanic', 'Vehicle maintenance', 'Diagnostics', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety procedures', 'Tool operation', 'Documentation'],
  '5711': ['Chemical, biological, radiological, nuclear defense specialist', 'CBRN operations', 'Detection equipment', 'Decontamination', 'Hazard assessment', 'Safety procedures', 'Emergency response', 'Training', 'Documentation', 'Team coordination'],
  '5811': ['Military police', 'Law enforcement', 'Security operations', 'Patrol procedures', 'Investigations', 'Traffic control', 'Use of force', 'Report writing', 'Community relations', 'Emergency response'],
  '5939': ['Aviation communication systems technician', 'Communications systems', 'Avionics', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Team coordination'],
  '6046': ['Aircraft maintenance', 'Troubleshooting', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety inspections', 'Documentation', 'Tool management', 'Team coordination'],
  '6072': ['Helicopter crew chief', 'Aircraft maintenance', 'Flight operations', 'Troubleshooting', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Team leadership'],
  '6212': ['Aircraft communications/navigation/radar systems technician', 'Avionics systems', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Precision work', 'Team coordination'],
  '6322': ['Unmanned aircraft system repairer', 'UAV systems', 'Troubleshooting', 'Maintenance', 'Technical procedures', 'Quality control', 'Safety procedures', 'Documentation', 'Computer systems', 'Team coordination'],
  '6423': ['Aviation ordnance systems technician', 'Weapons systems', 'Ordnance handling', 'Maintenance', 'Safety procedures', 'Quality control', 'Technical procedures', 'Documentation', 'Precision work', 'Team coordination'],
  '6531': ['Aviation ordnance technician', 'Ordnance handling', 'Weapons loading', 'Safety procedures', 'Maintenance', 'Quality control', 'Technical procedures', 'Documentation', 'Team coordination', 'Attention to detail'],

  // COAST GUARD RATINGS - Comprehensive Coverage
  'BM': ['Boatswain's mate', 'Boat operations', 'Navigation', 'Search and rescue', 'Maritime law enforcement', 'Seamanship', 'Damage control', 'Leadership', 'Safety compliance', 'Emergency response'],
  'DC': ['Damage controlman', 'Damage control', 'Firefighting', 'Emergency response', 'Equipment maintenance', 'Training', 'Safety procedures', 'CBRN defense', 'Documentation', 'Team leadership'],
  'EM': ['Electrician's mate', 'Electrical systems', 'Power generation', 'Troubleshooting', 'Maintenance', 'Safety procedures', 'Blueprint reading', 'Quality control', 'Documentation', 'Team coordination'],
  'ET': ['Electronics technician', 'Electronics systems', 'Radar', 'Navigation systems', 'Communications', 'Troubleshooting', 'Repair procedures', 'Technical manuals', 'Documentation', 'Quality control'],
  'FS': ['Food service specialist', 'Food preparation', 'Menu planning', 'Sanitation', 'Nutrition', 'Inventory management', 'Food safety', 'Customer service', 'Leadership', 'Team coordination'],
  'HS': ['Health services technician', 'Patient care', 'Medical procedures', 'Emergency response', 'Medical documentation', 'Pharmacy operations', 'Patient education', 'Clinical skills', 'Team collaboration', 'Health promotion'],
  'IS': ['Intelligence specialist', 'Intelligence analysis', 'Data collection', 'Briefing preparation', 'Database management', 'Research', 'Reporting', 'Security procedures', 'Presentation skills', 'Critical thinking'],
  'IT': ['Information systems technician', 'Network administration', 'Computer systems', 'Troubleshooting', 'Security procedures', 'User support', 'Documentation', 'Software installation', 'Hardware maintenance', 'Quality control'],
  'ME': ['Maritime enforcement specialist', 'Law enforcement', 'Boarding operations', 'Investigations', 'Use of force', 'Maritime law', 'Physical fitness', 'Report writing', 'Team coordination', 'Emergency response'],
  'MK': ['Machinery technician', 'Engine maintenance', 'Troubleshooting', 'Repair procedures', 'Preventive maintenance', 'Technical manuals', 'Quality control', 'Safety procedures', 'Documentation', 'Team coordination'],
  'MST': ['Marine science technician', 'Environmental protection', 'Pollution response', 'Inspections', 'Investigations', 'Data collection', 'Technical procedures', 'Reporting', 'Safety procedures', 'Team coordination'],
  'OS': ['Operations specialist', 'Radar operations', 'Communications', 'Navigation', 'Search and rescue coordination', 'Watchstanding', 'Data analysis', 'Multi-tasking', 'Team coordination', 'Emergency procedures'],
  'PA': ['Public affairs specialist', 'Media relations', 'Photography', 'Videography', 'Journalism', 'Public speaking', 'Social media', 'Communication', 'Creative design', 'Event planning'],
  'SK': ['Storekeeper', 'Supply chain management', 'Inventory control', 'Procurement', 'Documentation', 'Customer service', 'Data entry', 'Warehouse operations', 'Quality control', 'Organization'],
  'YN': ['Yeoman', 'Office administration', 'Correspondence', 'Record keeping', 'Data entry', 'Customer service', 'Regulations compliance', 'Communication', 'Organizational skills', 'Computer skills'],

  // SPACE FORCE AFSC - Comprehensive Coverage
  '1C6X1': ['Space systems operations', 'Satellite operations', 'Space surveillance', 'Orbital mechanics', 'Communication systems', 'Data analysis', 'Technical procedures', 'Mission planning', 'Team coordination', 'Problem solving'],
  '3D1X7': ['Cable and antenna systems', 'Installation', 'Maintenance', 'Troubleshooting', 'Testing', 'Blueprint reading', 'Safety procedures', 'Documentation', 'Quality control', 'Team coordination'],
  '5C0X1': ['Command and control operations', 'Mission planning', 'Space operations', 'Data analysis', 'Communication systems', 'Coordination', 'Technical procedures', 'Decision making', 'Team leadership', 'Problem solving'],
};

const ALL_SKILLS = Array.from(new Set(Object.values(MOS_SKILLS).flat()));

interface ResumeSkillsProps {
  onSelect: (skills: string[]) => void;
}
const ResumeSkills: React.FC<ResumeSkillsProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');

  const filtered = ALL_SKILLS.filter((skill: string) =>
    skill.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSkill = (skill: string) => {
    setSelected((sel: string[]) =>
      sel.includes(skill) ? sel.filter((s: string) => s !== skill) : [...sel, skill]
    );
  };

  return (
    <div className={styles.resumeSkillsContainer}>
      <label className={styles.label}>Military Skills & Phrases</label>
      <input
        type="text"
        placeholder="Search skills..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        className={styles.input}
      />
      <div className={styles.skillsList}>
        {filtered.map(skill => (
          <span
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={styles.skill + (selected.includes(skill) ? ' ' + styles.selected : '')}
          >
            {skill}
          </span>
        ))}
      </div>
      <button
        onClick={() => onSelect(selected)}
        className={styles.addButton}
      >
        Add Selected Skills
      </button>
    </div>
  );
};

// Expose MOS_SKILLS for dynamic access
(ResumeSkills as any).__MOS_SKILLS = MOS_SKILLS;
export default ResumeSkills;
