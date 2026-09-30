/* Original practice questions. Continue by chapter; keep stable IDs once used. */
(function (root) {
  'use strict';
  var L = root.L;
  function add(id, concept, question, options, key, rationales, explanation, hint) {
    var source = 'B' + concept.match(/^ch(\d+)-/)[1] + concept.split('-').slice(1).join('-');
    L.ITEMS.push({ id:id, c:concept, t:'mc', q:question, o:options.map(function (t,i) { return { t:t, ok:i===key, w:i===key?'':rationales[i] }; }),
      s:[source], tier:1, pool:'b', hint:hint || 'Identify the finding that changes the interpretation.', explain:explanation });
  }
  L.addMC = add;
  add('ch13-nodes-01','ch13-nodes',
    'A small, smooth structure is felt just below the mandible. Which finding would favor a lymph node over the nearby submandibular gland?',
    ['A larger lobulated surface','A smaller ovoid shape','An irregular broad surface','A structure deep to the mandibular margin'],1,
    ['The gland is larger and lobulated.','','An irregular broad surface better describes the gland.','The question is about the node, which lies superficial to the gland.'],
    'Bates distinguishes a normally smaller, smooth, ovoid submandibular node from the larger lobulated gland.');
  add('ch13-nodes-02','ch13-nodes',
    'An enlarged left supraclavicular node is discovered during a neck examination. Which follow-up focus is most directly supported by its drainage significance?',
    ['Only the ipsilateral external ear','Thoracic and abdominal sources','Only the scalp at the occiput','Only the ipsilateral parotid duct'],1,
    ['The external ear does not capture the concern raised by this node.','','The occipital region is not the key drainage concern here.','A parotid duct problem is not the principal implication of a left supraclavicular node.'],
    'An enlarged left supraclavicular, or Virchow, node can suggest thoracic or abdominal malignancy and warrants examination beyond the neck.');
  add('ch13-thyroid-01','ch13-thyroid',
    'During palpation of a neck mass, the patient swallows a sip of water and the mass rises. Which structure is most consistent with that movement?',
    ['Thyroid gland','Submandibular lymph node','Carotid artery','Posterior triangle lymph node'],0,
    ['','A submandibular node is not identified by rising with swallowing.','A carotid pulse has a different rhythmic movement.','Posterior triangle nodes are lateral to the thyroid landmarks.'],
    'The thyroid gland moves upward with the laryngeal structures during swallowing.');
  add('ch13-thyroid-02','ch13-thyroid',
    'The examiner can feel an enlarged thyroid but cannot palpate its lower pole. Which anatomic extension should be considered?',
    ['Into the parotid region','Behind the sternum','Into the posterior cervical triangle','Across the floor of the mouth'],1,
    ['The parotid region is not the inferior thyroid extension described.','','The posterior triangle is lateral and posterior, not the missing lower pole.','The floor of the mouth does not explain an inaccessible inferior pole.'],
    'Failure to feel an enlarged thyroid’s lower pole suggests a retrosternal component.');
  add('ch14-blur-01','ch14-blur',
    'A patient reports blurred vision that began abruptly with new floaters. Which history detail in Box 14-3 most changes the differential compared with gradually worsening blur?',
    ['Whether the blur affects near tasks','The sudden onset and associated floaters','Whether the patient has a history of dry eye','Whether the patient wears corrective lenses'],1,
    ['Near versus distance difficulty is useful but does not explain the acute change with floaters.','','Dry-eye history can contribute to blur but does not account for the acute pattern as directly.','Corrective lenses are relevant background but less discriminating here.'],
    'Bates uses onset and associated floaters to distinguish a potentially acute retinal process from more gradual causes.');
  add('ch14-blur-02','ch14-blur',
    'A patient with slowly progressive blur asks why the examiner is asking about diabetes. Which answer best reflects the purpose of that question?',
    ['Diabetes can affect retinal vessels','Diabetes always causes corneal injury','Diabetes excludes lens opacity','Diabetes makes visual acuity testing unnecessary'],0,
    ['','The Bible links diabetes to retinopathy, not inevitable corneal injury.','Cataract risk and diabetes can coexist.','Visual acuity still needs measurement.'],
    'Diabetic retinopathy is a possible cause of blurred vision, so systemic history helps interpret the complaint.');
  add('ch14-redpain-01','ch14-redpain',
    'A patient has a sharply bounded red patch on the white of one eye, no pain, and unchanged vision. Which finding pattern from the red-eye comparison fits best?',
    ['Acute angle-closure glaucoma','Corneal abrasion','Subconjunctival hemorrhage','Acute iritis'],2,
    ['Glaucoma can cause pain and visual change.','A corneal abrasion is painful.','','Iritis is associated with pain and often light sensitivity.'],
    'Bates describes a sharply demarcated, painless red area with preserved vision in subconjunctival hemorrhage.');
  add('ch14-redpain-02','ch14-redpain',
    'A patient with a red eye reports pain that worsens in bright light. Which history question most directly explores the feature that separates this complaint from simple irritation?',
    ['Is there any discharge from the eye?','Does light make the pain worse?','Did the redness begin after a new eye product?','Have you had this redness before?'],1,
    ['Discharge helps assess infection but does not characterize the reported light-triggered pain.','','A product exposure helps assess irritation but does not address photophobia.','Prior episodes matter but are less direct for this symptom.'],
    'Box 14-4 asks about light exposure because photophobia can point toward a deeper inflammatory cause such as uveitis.');
  add('ch14-acuity-01','ch14-acuity',
    'A patient says vision is blurred in both eyes. Which testing method gives an interpretable baseline for each eye?',
    ['Read the chart with both eyes open only','Test each eye separately at the chart’s specified distance','Test only the eye the patient thinks is worse','Skip the chart if the patient uses glasses'],1,
    ['Binocular testing can conceal a unilateral deficit.','','Both eyes require assessment.','Correction status should be documented, not used to skip the test.'],
    'Visual acuity is measured separately for each eye at the intended chart distance.');
  add('ch14-acuity-02','ch14-acuity',
    'A patient’s distance acuity improves when viewed through a pinhole. Which interpretation is most consistent with that change?',
    ['A refractive contribution to the blur','A definite retinal detachment','A definite acute glaucoma attack','An absent near reaction'],0,
    ['','Pinhole improvement does not establish retinal detachment.','It does not diagnose glaucoma.','Pinhole acuity and pupillary near reaction test different functions.'],
    'Improvement with a pinhole suggests that refractive error contributes to reduced acuity.');
  add('ch14-cornea-01','ch14-cornea',
    'An opacity is seen deeper than the clear corneal surface and is visible through the pupil. Which structure is most likely involved?',
    ['Bulbar conjunctiva','Lens','Eyelid margin','Corneal epithelium'],1,
    ['The conjunctiva is superficial, not a deep pupil opacity.','','The eyelid margin lies outside the visual axis.','A corneal surface lesion is more superficial.'],
    'Bates places cataract opacity in the lens, visible through the pupil, in contrast to superficial corneal opacity.');
  add('ch14-cornea-02','ch14-cornea',
    'A triangular thickening begins on the nasal conjunctiva and grows across the corneal surface. Which finding in Table 14-5 matches this description?',
    ['Pterygium','Nuclear cataract','Kayser–Fleischer ring','Corneal arcus'],0,
    ['','A nuclear cataract is a lens opacity.','A Kayser–Fleischer ring is a peripheral copper deposit.','Arcus is a grayish corneal arc or circle, not triangular growth.'],
    'Pterygium is a triangular conjunctival growth that can extend onto the cornea.');
  add('ch14-near-01','ch14-near',
    'When a patient shifts gaze from the far wall to a pencil close to the nose, which visible pair should the examiner expect?',
    ['Pupil dilation and outward eye movement','Pupil constriction and convergence','Pupil dilation and convergence','Pupil constriction and outward eye movement'],1,
    ['Both pupil size and eye direction are reversed.','','The pupils constrict with near effort.','The eyes turn inward, not outward.'],
    'Near effort produces pupillary constriction and convergence; lens accommodation accompanies them but is not directly visible.');
  add('ch14-near-02','ch14-near',
    'The examiner moves a target toward the bridge of the nose to assess convergence. Which muscles bring both eyes inward?',
    ['Bilateral lateral recti','Bilateral medial recti','Bilateral superior obliques','Bilateral inferior recti'],1,
    ['Lateral recti abduct the eyes.','','Superior obliques do not create the bilateral inward movement.','Inferior recti chiefly depress the eyes.'],
    'Bates identifies convergence as bilateral medial rectus movement.');
  add('ch15-tinnitus-01','ch15-tinnitus',
    'A patient describes a sound that rises and falls with the pulse. Which associated history most directly investigates the pattern?',
    ['Recent swimming','Cardiovascular disease','Difficulty hearing consonants','Prior middle-ear infection'],1,
    ['Swimming is most relevant to an external-ear infection.','','High-frequency hearing difficulty does not specifically explain a pulse-synchronous sound.','Middle-ear infection is relevant to ear symptoms but not the strongest clue for pulsatile tinnitus.'],
    'The Chapter 15 supplement links pulsatile tinnitus with vascular and cardiovascular causes.');
  add('ch15-tinnitus-02','ch15-tinnitus',
    'A patient has ringing in only the left ear. Which distinction should the examiner pursue before treating it as ordinary bilateral age-related hearing loss?',
    ['Whether the sound is unilateral and accompanied by imbalance','Whether both ears have equal cerumen','Whether the patient uses a telephone','Whether the sound occurs after meals'],0,
    ['','Equal cerumen does not characterize the important unilateral symptom cluster.','Telephone use is not the key comparison.','Meal timing is not a listed discriminator.'],
    'Unilateral tinnitus with imbalance or hearing change can point to a different cause from bilateral age-related symptoms.');
  add('ch15-vertigo-01','ch15-vertigo',
    'A patient has brief spinning episodes when rolling onto one side in bed. Hearing is unchanged and there is no tinnitus. Which peripheral pattern fits best?',
    ['Ménière disease','Acute labyrinthitis','Benign positional vertigo','Acoustic neuroma'],2,
    ['Ménière episodes last longer and often include fluctuating hearing loss and tinnitus.','Labyrinthitis may impair hearing and lasts longer.','','Acoustic neuroma is usually insidious with one-sided hearing change.'],
    'Brief position-triggered vertigo without hearing symptoms matches the BPPV pattern in Table 15-1.');
  add('ch15-vertigo-02','ch15-vertigo',
    'A patient has recurrent hours-long vertigo with fluctuating hearing loss, tinnitus, and pressure in one ear. Which diagnosis best matches the full cluster?',
    ['Vestibular neuronitis','Ménière disease','Benign positional vertigo','Central vertigo'],1,
    ['Neuronitis generally lacks hearing loss and tinnitus.','','BPPV episodes are seconds to under a minute and generally lack hearing symptoms.','Central vertigo usually lacks hearing symptoms and may include brainstem deficits.'],
    'Table 15-1 links recurrent longer vertigo, fluctuating sensorineural hearing loss, tinnitus, and aural fullness with Ménière disease.');
  add('ch15-hearing-01','ch15-hearing',
    'The Weber test lateralizes to the patient’s poorer-hearing right ear. Which type of unilateral loss does that result favor?',
    ['Right conductive loss','Right sensorineural loss','Left conductive loss','Bilateral sensorineural loss'],0,
    ['','With right sensorineural loss, Weber favors the better left ear.','Left conductive loss would favor the left ear.','Bilateral loss is not classified by this unilateral lateralization pattern.'],
    'Weber sound lateralizes to the impaired ear in unilateral conductive loss.');
  add('ch15-hearing-02','ch15-hearing',
    'On Rinne testing, a patient hears the fork at the mastoid at least as long as beside the ear canal. Which interpretation follows?',
    ['Normal air conduction advantage','Conductive loss in the tested ear','Sensorineural loss with preserved air-bone ratio','A normal Weber result'],1,
    ['Normal Rinne has air conduction longer than bone conduction.','','Sensorineural loss generally preserves air conduction longer than bone conduction.','Rinne alone does not report Weber lateralization.'],
    'Bone conduction equal to or longer than air conduction is the conductive-loss pattern in the Chapter 15 supplement.');
  add('ch15-nose-01','ch15-nose',
    'While inspecting the nasal cavity with an otoscope, which direction should the examiner initially avoid pressing against because it is sensitive?',
    ['The lateral vestibule','The nasal septum','The inferior turbinate','The middle meatus'],1,
    ['The vestibule is the entry point for the speculum.','','The turbinates should be inspected without force, but the supplement specifically cautions against the septum.','The middle meatus is an observation site, not the named sensitive surface.'],
    'The nose-examination technique calls for gentle speculum insertion into the vestibule while avoiding the sensitive septum.');
  add('ch15-nose-02','ch15-nose',
    'The examiner wants to assess the maxillary sinuses for tenderness. Where should pressure be applied?',
    ['Upward beneath the cheekbones','Upward under the bony eyebrows','Over the mastoid processes','Directly onto the eyes'],0,
    ['','Pressure under the brows tests the frontal sinuses.','Mastoid palpation is an ear-region maneuver.','The eye should not be pressed to assess a sinus.'],
    'Bates describes upward pressure under the zygomatic bones for maxillary sinus tenderness.');
  add('ch16-oral-01','ch16-oral',
    'A patient has a thickened white patch on the inner cheek and a history of frequent chewing-tobacco use. Which finding from Table 16-2 is the best match?',
    ['Fordyce spots','Koplik spots','Leukoplakia','Torus palatinus'],2,
    ['Fordyce spots are small yellowish sebaceous spots.','Koplik spots are small white specks on a red background near molars.','','Torus palatinus is a bony midline hard-palate growth.'],
    'Table 16-2 describes leukoplakia as a thickened white oral patch that may follow local irritation and needs assessment.');
  add('ch16-oral-02','ch16-oral',
    'An oral examination finds a firm midline bony prominence on the hard palate without other symptoms. Which table entry fits?',
    ['Thrush','Kaposi sarcoma','Torus palatinus','Exudative tonsillitis'],2,
    ['Thrush produces white plaques on mucosa.','Kaposi lesions are characteristically deep purple.','','Tonsillar exudate occurs in the pharynx, not as a bony palatal prominence.'],
    'A torus palatinus is a benign bony growth centered on the hard palate.');
})(typeof window !== 'undefined' ? window : globalThis);
