// seatBlocks.js
// Centralized seat index allocation for alliances based on Bihar 2020 Election Results
// CRITICAL: Must stay in sync with push order in AssemblyLayout (documented there).
// Current push order:
//   S1(50) -> S2(50) -> C-R(22) -> C-L(21) -> S5(50) -> S6(50) = 243
// 
// Bihar 2020 Results:
//   NDA: 125 seats (BJP: 74, JD(U): 43, HAM-S: 4, VIP: 4)
//   MGB: 110 seats (RJD: 75, INC: 19, CPI(ML)(L): 12, CPI: 2, CPM: 2) 
//   OTH: 8 seats (AIMIM: 5, BSP: 1, LJP: 1, IND: 1)
//
// SAFEGUARD: If seat counts change or ordering is refactored, update BOTH this
// file and the explanatory block comment in AssemblyLayout.
export const SEAT_BLOCKS = {
  NDA: [
    // First 125 seats for NDA (won 125 seats in Bihar 2020)
    ...Array.from({ length: 50 }, (_, i) => i),           // S1 section
    ...Array.from({ length: 50 }, (_, i) => 50 + i),      // S2 section  
    ...Array.from({ length: 22 }, (_, i) => 100 + i),     // C-R section
    ...Array.from({ length: 3 }, (_, i) => 122 + i)       // Part of C-L section
  ],
  MGB: [
    // Next 110 seats for Mahagathbandhan (won 110 seats in Bihar 2020)
    ...Array.from({ length: 18 }, (_, i) => 125 + i),     // Rest of C-L section
    ...Array.from({ length: 50 }, (_, i) => 143 + i),     // S5 section
    ...Array.from({ length: 42 }, (_, i) => 193 + i)      // Part of S6 section
  ],
  OTH: [
    // Remaining 8 seats for Others (won 8 seats in Bihar 2020)
    ...Array.from({ length: 8 }, (_, i) => 235 + i)       // Rest of S6 section
  ]
};

export const TOTAL_SEATS = 243;
