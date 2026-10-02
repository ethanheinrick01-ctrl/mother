from pathlib import Path
import json,re,collections
P=Path(__file__).resolve().parent;D=P.parent
C=[]
def add(n,labels,refs,status='Direct',gap=''):
 for label in labels.split(';'):C.append(dict(prompt=n,component=label,status=status,locators=refs,gap=gap))
add(1,'Trisomy 21','4:20,22,29')
add(2,'Selected chromosomal and metabolic causes','4:22,28,30,33;6:12,13,15','Partial','Complete etiologic classification not supplied.')
add(3,'Chloride-channel defect and recessive model','4:45');add(3,'Named CF gene and mutation','4:45','Missing','Obtain ninth-edition cystic fibrosis gene passage.')
add(4,'Two-allele recessive model;Carrier cross probabilities','4:45,46,47')
add(5,'Hemophilia A inheritance','4:5,49,52,53','Missing','Objective names hemophilia but exact Hemophilia A association is absent.')
add(6,'Obesity and family history risk;Obesity and insulin resistance','5:28,29,30N;13:14')
add(7,'Carcinoma definition','12:12,13');add(8,'Matrix degradation;Invasion and vascular access','12:38,39,40,41');add(9,'Adjuvant timing and purpose','12:57')
add(10,'Peak growth timing;Embryonal subgroup timing','14:6,17N');add(11,'Prenatal DES association','13:8;14:11');add(11,'Specific malignancy and mechanism','13:8;14:11','Missing','Textbook passage on DES-exposed offspring needed.')
add(12,'Mesodermal and embryonal origins','14:4,6');add(13,'N-myc and neuroblastoma association','14:10N');add(13,'N-myc mechanism','14:10N','Missing','Amplification and significance not developed.')
add(14,'Eccrine cooling','46:17,18N');add(15,'Stage I–IV findings;Unstageable and deep tissue findings','46:27,28,29,30')
add(16,'Collagen and fibroblast mechanism;Keloid appearance and border contrast','46:24,31,32');add(17,'Plaque, inverse, guttate, pustular, erythrodermic types','46:43,44,45');add(18,'Varicella-zoster identity','46:74;47:34,35,37')
add(19,'Sclerosis and fibroblast mechanism;Supplied skin manifestations','46:84');add(19,'Localized versus systemic definition','46:84','Partial','Heading says morphea while body mentions internal organs; obtain clarification.')
add(20,'Named frostbite inflammatory mediators','46:95,97,98','Missing','Inflammation/reperfusion are present but mediator names are absent.')
add(21,'Ibuprofen purpose in frostbite','46:99','Missing','Analgesic class alone does not support drug-specific mechanism.')
add(22,'Barrier and immune pathophysiology;Age-dependent distribution;Pruritus and lichenification','47:9,10,11');add(22,'Immunoglobulin;Laboratory findings','47:9,10,11','Missing','Obtain the assigned atopic dermatitis Ig and laboratory passage.')
add(23,'Candida complication and satellite lesions','47:12,13,61N')
for label,ref in [('Impetigo','47:15,16,17'),('Tinea','47:22,23,25,26'),('Thrush','47:27')]:add(24,';'.join(label+': '+s for s in ['definition','pathophysiology','manifestations','source of infection']),ref)
add(25,'Restore oxygen delivery and perfusion;Cause-specific treatment goals','49:5,27,28,34,39')
for label,ref,management in [('Adult cardiogenic','48:9,10,11,12','Direct'),('Adult hypovolemic','48:14,15','Direct'),('Adult neurogenic','48:16,17,18','Partial'),('Adult anaphylactic','48:19,20,21','Direct'),('Adult septic','48:22,24','Direct'),('Pediatric hypovolemic','49:24,25,26,27','Direct'),('Pediatric cardiogenic','49:28','Direct'),('Pediatric septic','49:29,32,33,34','Direct'),('Pediatric neurogenic','49:35','Direct'),('Pediatric obstructive','49:11,37,38,39','Direct')]:
 add(26,label+': mechanism;'+label+': findings',ref);add(26,label+': supplied management',ref,management,'Adult management only briefly lists pain reduction; complete sequence missing.' if management=='Partial' else '')
add(26,'Adult obstructive mechanism, findings and management','48:8;49:11,39','Missing','Adult-specific section not supplied; pediatric comparison available.')
add(26,'Pediatric anaphylaxis mechanism','49:10','Partial','Named under distributive; full pediatric mechanism not developed.');add(26,'Pediatric anaphylaxis findings and management','49:10','Missing','No pediatric-specific passage.')
for label in ['Epidermal only','Superficial dermal','Deep dermal','Full thickness']:
 add(27,label+': tissue destruction;'+label+': clinical appearance','48:43,44,51,52')
add(27,'Adult and pediatric severity factors','48:45;49:43,46');add(27,'Adult systemic pathophysiology;Adult complications;General adult management','48:46,47,48,49,50,54,55')
add(27,'Pediatric systemic pathophysiology;Pediatric complications;Pediatric wound and rehabilitation management','49:48,49,50,51,52,53,54,56,57,58,59,60,61,62,63,64,65,66')
add(27,'Body-surface calculation','48:45;49:45','Partial','Methods named; validated chart, corrected percentages and worked problems absent.')
add(27,'Modified Parkland formula','49:53','Missing','Formula named but not provided.');add(27,'Complete depth-specific management','48:54,55;49:62','Partial','General interventions supplied; complete protocols absent.')
add(28,'Capillary seal endpoint','48:47');add(29,'Electrical-burn renal mechanism','49:44,54','Missing','Only general burn renal changes supplied.')
for label,ref in [('Klinefelter','4:24,25'),('Turner','4:24'),('Cri du chat','4:28')]:add(30,label+' chromosome change;'+label+' manifestations',ref)
add(31,'Dermatophyte site names;Candida host conditions;KOH testing','46:78,79,80,81;47:22,23,25,27');add(32,'Adipocytes and connective tissue','46:16');add(33,'Marker definition;Marker examples and specificity limits','12:50,51,52')
add(34,'FAP and APC association','5:22;12:54');add(34,'Polyp morphology, histology and manifestations','5:22;12:54','Missing','FAP association is not full characterization of intestinal polyps.')
add(35,'Inflammatory proliferation and angiogenesis','12:32,33,34;13:5');add(36,'Positive smoking-related cancer list','13:9');add(37,'Trisomy 21 and leukemia','14:9,10N');add(37,'Complete malformation/leukemia associations','14:8,9','Partial','Only selected syndromes, not exhaustive mapping.')
add(38,'Dermal mast cells and histamine;Type I urticaria;Type IV contact dermatitis;Immune-complex vasculitis','46:15,36,82,83');add(38,'Full reaction-layer-mediator comparison','46:15,36,82,83','Partial','Named examples only.')
add(39,'Antigen processing and T-cell sensitization','46:36,37');add(40,'Latex immunoglobulin relationship','46:36,83','Missing','General hypersensitivity classes do not establish latex-specific key.')
add(41,'Medication-induced psoriasis exacerbation','46:43,44,45','Missing','Treatments are supplied; triggers are absent.')
add(42,'PTCH1 and TP53 association','46:88,94N');add(43,'MODS definition;Primary and secondary mechanism;Clinical organ manifestations;Management and prevention','48:26,27,29,31,32,33,34,35,36,37,38,39,40;49:7,8,40,41')
add(44,'Transcription;Nondisjunction;Aneuploidy;Polyploidy;Translocation','4:12,17,18,20,29');add(45,'ABO inheritance crosses','4:34','Missing','Codominance definition is not ABO allele evidence.')
add(46,'Variable manifestations','4:44');add(46,'Gene/protein pathophysiology;Degrees or types','4:44','Missing','Expressivity example is not a complete neurofibromatosis passage.')
add(47,'Penetrance;Expressivity;Dominance;Recessiveness','4:34,43,44');add(48,'Incidence;Prevalence;Relative risk','5:5,6')
add(49,'Breast and colorectal familial patterns;Prostate genetic risk mention','5:19,20,22,23');add(49,'Exhaustive clustering list','5:19,20,22,23','Partial','No comprehensive list is supplied.')
add(50,'BRCA1/BRCA2 chromosome mapping;Breast and ovarian susceptibility','5:20,21N;12:54');add(50,'Mutation details and functional mechanisms','5:20,21N;12:54','Partial','Association and mapping only; no mutation-by-mutation detail.')
add(51,'Autosomal recessive rules','4:45,46,47');add(51,'Autosomal dominant rules','4:38,39,40');add(51,'X-linked recessive rules','4:49,52,53');add(51,'X-linked dominant rules','4:36','Missing','Pattern named, but transmission rules not developed.')
add(51,'Two autosomal recessive disease examples','4:33,45','Partial','CF explicit; PKU genotype example lacks a direct recessive label here.');add(51,'Two autosomal dominant examples','4:43,44','Partial','Von Recklinghausen explicitly labeled; Huntington appears as age-dependent penetrance without an explicit dominant label in that passage.');add(51,'Two X-linked recessive examples','4:49,52,53,54','Partial','Duchenne supplied explicitly; second mapped disease missing.');add(51,'Two X-linked dominant examples','4:36','Missing','Pattern named without the two requested disease examples.')
for c in C:
 loc=[]
 for g in c['locators'].split(';'):
  ch,ss=g.split(':')
  for s in ss.split(','):loc.append(f'Chapter {ch}, slide {s[:-1]} speaker notes' if s.endswith('N') else f'Chapter {ch}, slide {s}')
 c['exactLocators']=loc
counts=dict(collections.Counter(c['status'] for c in C));(D/'component-coverage.json').write_text(json.dumps(dict(counts=counts,components=C),indent=2))
(D/'COMPONENT-COVERAGE.md').write_text('# Unit 7 component coverage\n\n'+str(counts)+'\n\nDirect means supported at the supplied slide/notes depth, not textbook completeness. Partial has a named unresolved component. Missing keys are gated. Counts are source coverage, never predicted exam weighting.\n\n| Prompt | Component | Status | Exact source | Missing component |\n|---|---|---|---|---|\n'+'\n'.join(f"| {c['prompt']} | {c['component']} | {c['status']} | {'; '.join(c['exactLocators'])} | {c['gap'] or '—'} |" for c in C))
print(counts,len(C))
