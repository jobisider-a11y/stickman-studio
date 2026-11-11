// cast.js: 24 Hours in the Life of an Airliner. One signature item each, identical everywhere.
export const PAX = { top: 'hoodie', color: '#d64a33', head: 'none' };                          // "you", the passenger
export const PILOT = { top: 'suit', color: '#1f2a44', head: 'cap', headColor: '#f2c21a' };     // the captain (yellow cap)
export const MECH = { top: 'jersey', color: '#ff8a1f', head: 'beanie', headColor: '#ff8a1f' };  // the mechanic (orange hi-vis)
export const CREW = { top: 'suit', color: '#8a5ad6', head: 'bun' };                            // flight attendant (purple)
export const EXTRA = { top: 'none', head: 'none' };
export const EXTRA2 = { top: 'none', head: 'bun' };
export const PILOT2 = { top: 'suit', color: '#1f2a44', head: 'cap', headColor: '#3fb950' };  // the afternoon captain (green cap)
export const WARREN = { top: 'labcoat', face: 'glasses', head: 'none' };              // David Warren, scientist
export const WARREN_KID = { top: 'tshirt', color: '#3a6ea5', face: 'glasses', head: 'none', kid: true };
export const OFFICIAL = { top: 'suit', color: '#3a3430', head: 'fedora', headColor: '#2a2018' };
export const WHO = { WARREN, WARREN_KID, OFFICIAL, PAX, PILOT, PILOT2, MECH, CREW, EXTRA, EXTRA2 };
