// Where each travel photo was taken, as tagged on Instagram. Instagram does not
// share a post's location with websites, so these were read from the public post
// pages and recorded here. Only posts listed here appear on the Traveller page
// (/travels), grouped by area.
//
// To add a photo: open the post on Instagram, copy the code after /p/ in its
// address (instagram.com/p/<code>/), and add a line to `photos` below with the
// spot as tagged and the area it belongs to (add a new area first if needed).

export type Area = {
  name: string;
  region: string;
  /** Three letters for the leg's stamp. */
  mark: string;
};

export const areas = {
  ellora: { name: "Ellora Caves", region: "Maharashtra", mark: "ELR" },
  sahyadri: { name: "The Sahyadri", region: "Maharashtra", mark: "SAH" },
  kodaikanal: { name: "Kodaikanal", region: "Tamil Nadu", mark: "KOD" },
  nilgiris: { name: "The Nilgiris", region: "Tamil Nadu", mark: "NIL" },
  goa: { name: "Goa", region: "India", mark: "GOA" },
  puducherry: { name: "Puducherry", region: "India", mark: "PDY" },
  coast: { name: "The Karnataka Coast", region: "Karnataka", mark: "KAR" },
  coorg: { name: "Coorg", region: "Karnataka", mark: "CRG" },
  bangalore: { name: "Around Bangalore", region: "Karnataka", mark: "BLR" },
  odisha: { name: "Odisha", region: "Home", mark: "ODI" },
  koraput: { name: "Koraput", region: "Odisha", mark: "KPT" },
  jaipur: { name: "Jaipur", region: "Rajasthan", mark: "JAI" },
} satisfies Record<string, Area>;

export type AreaKey = keyof typeof areas;

/** Instagram post code → the spot as tagged, and its area. */
export const photos: Record<string, { spot: string; area: AreaKey }> = {
  DdZOiaLFHpN: { spot: "Ellora Caves", area: "ellora" },  // untagged; from its hashtags
  DcRMjB7lBbb: { spot: "Ellora Caves", area: "ellora" },
  "Da-zDI1FM6J": { spot: "Ellora Caves", area: "ellora" },
  DZ0OQhVlLyM: { spot: "Western Ghats", area: "sahyadri" },
  DYTl6l3lFTv: { spot: "Harihar Fort", area: "sahyadri" },
  "DXlRt42FNi-": { spot: "Harischandra Ghat", area: "sahyadri" },
  DWN4DwllBEM: { spot: "Kalu Waterfall, Malshej Ghat", area: "sahyadri" },
  "DVVOK-xFG9T": { spot: "Kokankada", area: "sahyadri" },
  DVDGuBNkuEn: { spot: "Western Ghats", area: "sahyadri" },
  DRqz9YUFOpH: { spot: "Vanarlingi Pinnacle", area: "sahyadri" },  // untagged; location added by hand
  DRbPKP2j0ET: { spot: "Vanarlingi Pinnacle", area: "sahyadri" },  // untagged; location added by hand
  DRGwxQ7FIUu: { spot: "वानरलिंगी सुलखा, जीवधन गड", area: "sahyadri" },
  DQ02qU2kf6h: { spot: "Harihar Fort", area: "sahyadri" },
  DQhUY1XgTOb: { spot: "Nashik", area: "sahyadri" },
  DPwPASoFJ_j: { spot: "Harihar Fort", area: "sahyadri" },  // untagged; location added by hand
  DOBIzY2k1KQ: { spot: "Harischandra Range", area: "sahyadri" },
  DNqO20tBcr1: { spot: "Nane Ghat, Jivdhan Fort", area: "sahyadri" },
  DNGWjYYh71t: { spot: "Harischandra Ghat", area: "sahyadri" },
  DM0TKfEyOcy: { spot: "Nane Ghat, Jivdhan Fort", area: "sahyadri" },
  DMj0sRlByVJ: { spot: "Nane Ghat, Jivdhan Fort", area: "sahyadri" },
  DMdKym5BUt2: { spot: "Nane Ghat, Jivdhan Fort", area: "sahyadri" },
  DLq8EL9hc_L: { spot: "Western Ghats", area: "sahyadri" },
  DFfguPTPJ1V: { spot: "Echo Point", area: "kodaikanal" },
  DFSPZd5PMyz: { spot: "Dolphin's Nose", area: "kodaikanal" },
  DE7nOE9vNAV: { spot: "Princess of Hills", area: "kodaikanal" },
  DEpy7ClB9UN: { spot: "Echo Point", area: "kodaikanal" },
  DEXiOp_y6UC: { spot: "Pine Forest", area: "kodaikanal" },
  DEFvV76CQya: { spot: "Princess of Hills", area: "kodaikanal" },
  DDzd36ZvEqN: { spot: "Princess of Hills", area: "kodaikanal" },
  DDhYsTavA3G: { spot: "Kodaikanal", area: "kodaikanal" },
  DDPVR2bvGW4: { spot: "Princess of Hills", area: "kodaikanal" },
  DC9doidhLI4: { spot: "Princess of Hills", area: "kodaikanal" },
  DCrkW4ECOI7: { spot: "Pine Forest", area: "kodaikanal" },
  DCZUnmtJfY9: { spot: "St. Peter's Church", area: "kodaikanal" },
  DCHTQFMPO3X: { spot: "Avalanche Forest Reserve", area: "nilgiris" },
  DB14rrci1KE: { spot: "Lamgao Buddhist Caves", area: "goa" },
  "DBjO-mniiTz": { spot: "Coorg", area: "coorg" },
  DBRWgc3zQQG: { spot: "Goa", area: "goa" },
  DA_H8RkIjZo: { spot: "Our Lady of the Immaculate Conception Church", area: "goa" },
  DAtNBDaz3li: { spot: "Chandrabhaga Beach", area: "odisha" },
  DAbQGvroonO: { spot: "Basilica Church", area: "goa" },
  "DAJFs5UT-QS": { spot: "Central Jail, Aguada", area: "goa" },
  "C_3ETyMoBC-": { spot: "Chapora Fort", area: "goa" },
  C_lB0opTxc3: { spot: "French Colony", area: "puducherry" },
  "C_TZ2-VTywI": { spot: "French Colony", area: "puducherry" },
  "C_A_Ia-zEeT": { spot: "French Colony", area: "puducherry" },
  "C-u-PytIJgW": { spot: "French Colony", area: "puducherry" },
  "C-c7i9zTaYk": { spot: "Anjuna Beach", area: "goa" },
  "C-K6QnvIsPP": { spot: "Lamgao Buddhist Caves", area: "goa" },
  C95BVZKzsdw: { spot: "Avalanche", area: "nilgiris" },
  C9m4t1NzW7U: { spot: "Nilgiri Hills", area: "nilgiris" },
  C9UxNQdzZrn: { spot: "Vagator Beach", area: "goa" },
  C9DCe90PClk: { spot: "Arambol Beach", area: "goa" },
  C8w08civfxC: { spot: "Chapora Fort", area: "goa" },
  C8exIMRIcOJ: { spot: "Vagator Beach", area: "goa" },
  C8MWaVtPF7B: { spot: "Vagator Beach", area: "goa" },
  C779X6goUyz: { spot: "Anjuna Beach", area: "goa" },
  C7osZvSRlg_: { spot: "St Mary's Island", area: "coast" },
  C7WqDwVxQ0b: { spot: "Dolphin's Nose", area: "nilgiris" },
  C7GMdcNReqC: { spot: "Green Hills", area: "nilgiris" },
  C6ylNJDR_1f: { spot: "Emerald Lake", area: "nilgiris" },
  C6gqLOpxsAs: { spot: "Avalanche", area: "nilgiris" },
  C6OhWnQxV9T: { spot: "Avalanche", area: "nilgiris" },
  C58jGsyRnrR: { spot: "Pine Forest", area: "nilgiris" },
  C5YfJwNxDgv: { spot: "Cubbon Park", area: "bangalore" },
  "C5V7ZCYR-eI": { spot: "Cubbon Park", area: "bangalore" },
  C5GkfJpR80Y: { spot: "Cubbon Park", area: "bangalore" },
  C40nlqeRXy8: { spot: "Netrani Island", area: "coast" },  // untagged; location added by hand
  "C4m-iFvR7O8": { spot: "Netrani Island", area: "coast" },
  C374Oqjx3E1: { spot: "Netrani Island", area: "coast" },
  C3sTqBfxDUf: { spot: "Heart Island", area: "coast" },
  C3pmCg6RarY: { spot: "Murudeshwar", area: "coast" },
  "C3aSj59Ro-u": { spot: "Netrani Island", area: "coast" },
  C3U0KpXxPIq: { spot: "Mulki", area: "coast" },
  C3IOH1iRFCz: { spot: "Mulki", area: "coast" },
  C22G_t5xA2c: { spot: "Aquatic Indica Surf School", area: "coast" },
  C2kX0Drx6tF: { spot: "Aquatic Indica Surf School", area: "coast" },
  C2ZLODpxl1F: { spot: "Mulki", area: "coast" },
  C2R5KGtxJsd: { spot: "Mulki", area: "coast" },
  "C2AtW-gPhB1": { spot: "Mulki", area: "coast" },  // untagged; location added by hand
  "C16og-1xzGV": { spot: "Mulki", area: "coast" },  // untagged; location added by hand
  C1ukHjmPlW3: { spot: "Aquatic Indica Surf School", area: "coast" },
  C1W12whxHkc: { spot: "Coorg", area: "coorg" },  // untagged; location added by hand
  C1KJWlMR2z1: { spot: "Antar Gange", area: "bangalore" },
  C038WqFRPEA: { spot: "Coorg", area: "coorg" },  // untagged; location added by hand
  C0l9dwLRvuc: { spot: "Coorg", area: "coorg" },
  C0T9pjmx_p9: { spot: "Mandalpatti", area: "coorg" },
  C0B2umJRMLD: { spot: "Coorg", area: "coorg" },  // untagged; location added by hand
  Czxe6laxxkM: { spot: "Bird-World", area: "coorg" },
  Czd6XBMxZBT: { spot: "Bamboo Forest", area: "coorg" },
  CzMMbR5R_nm: { spot: "Coorg", area: "coorg" },  // untagged; from its hashtags
  "Cy59fP-xIEm": { spot: "Coorg", area: "coorg" },
  CytDRmvxAB_: { spot: "Mandalpatti", area: "coorg" },
  CyV_dxoRx30: { spot: "Nijagal Betta", area: "bangalore" },
  CyDsz2oxCTH: { spot: "Chandrabhaga Beach", area: "odisha" },
  CxyELsUxZtx: { spot: "Koraput", area: "koraput" },  // tagged "Mountains"; location added by hand
  CvsF4qzRqwt: { spot: "Bhubaneswar", area: "odisha" },
  CveL3ziRgON: { spot: "Nandi Hills", area: "bangalore" },  // mis-tagged; location added by hand
  CvOW36wIUtd: { spot: "Nandi Hills", area: "bangalore" },
  Cuu464bLXUM: { spot: "Adiyogi Statue, Chikkaballapur", area: "bangalore" },
  CtrLOrvxRI_: { spot: "Konark", area: "odisha" },  // tagged "Nowhere!!"; location added by hand
  Cq2f2FIL_Hr: { spot: "Bhubaneswar", area: "odisha" },  // tagged "Off Road..."; location added by hand
  CqkhHekr6AS: { spot: "CET, Bhubaneswar", area: "odisha" },
  CqXm6Z7Lwtm: { spot: "Amber Fort", area: "jaipur" },
  CouRpRrPLu6: { spot: "Balda Caves", area: "koraput" },  // tagged "Cave"; location added by hand
  "CoUIwrerFH-": { spot: "Deomali Hills", area: "koraput" },  // tagged "Mountains"; location added by hand
  Cn6OZg4Lir4: { spot: "Balda Caves", area: "koraput" },
  CjfkDDdLceM: { spot: "Marine Drive, Konark", area: "odisha" },
  CjfjApiruIz: { spot: "Marine Drive, Konark", area: "odisha" },
  CjfhsR6Ldzb: { spot: "Marine Drive, Konark", area: "odisha" },
};

/** The post code in an Instagram permalink (instagram.com/p/<code>/). */
export const postCode = (permalink: string) => permalink.match(/\/(?:p|reel|tv)\/([^/?#]+)/)?.[1] ?? "";

/** Where a post was taken, if recorded. */
export function placeOf(permalink: string) {
  const photo = photos[postCode(permalink)];
  return photo ? { ...photo, ...(areas[photo.area] as Area) } : null;
}
