// FR - Índice de todos os ranges
// Gerado automaticamente por split-dictionaries.ts

import { DICT_FR_a_d } from './a-d';
import { DICT_FR_e_h } from './e-h';
import { DICT_FR_i_l } from './i-l';
import { DICT_FR_m_p } from './m-p';
import { DICT_FR_q_t } from './q-t';
import { DICT_FR_u_z } from './u-z';
import { DICT_FR_special } from './special';

export type DictFrRange =
  | typeof DICT_FR_a_d
  | typeof DICT_FR_e_h
  | typeof DICT_FR_i_l
  | typeof DICT_FR_m_p
  | typeof DICT_FR_q_t
  | typeof DICT_FR_u_z
  | typeof DICT_FR_special
;

export const ALL_FR_RANGES: DictFrRange[] = [
  DICT_FR_a_d,
  DICT_FR_e_h,
  DICT_FR_i_l,
  DICT_FR_m_p,
  DICT_FR_q_t,
  DICT_FR_u_z,
  DICT_FR_special,
];

export const TOTAL_FR_ENTRIES = 15000;
