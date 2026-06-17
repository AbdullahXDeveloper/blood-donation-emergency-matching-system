// Blood group compatibility matrix
// Key = patient blood group, Value = array of donor blood groups that are compatible
export const compatibility = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

export const getCompatibleGroups = (patientBloodGroup) => {
  return compatibility[patientBloodGroup] || [];
};

export const isDonorCompatible = (donorGroup, patientGroup) => {
  const compatibleGroups = compatibility[patientGroup] || [];
  return compatibleGroups.includes(donorGroup);
};

export const DONATION_COOLDOWN_DAYS = 56;

export const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DONATION_COOLDOWN_DAYS);
  return new Date(lastDonationDate) < cutoff;
};
