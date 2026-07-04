// PT - Índice de todos os ranges
// Gerado automaticamente por split-dictionaries.ts

import { DICT_PT_a_d } from './a-d';
import { DICT_PT_e_h } from './e-h';
import { DICT_PT_i_l } from './i-l';
import { DICT_PT_m_p } from './m-p';
import { DICT_PT_q_t } from './q-t';
import { DICT_PT_u_z } from './u-z';
import { DICT_PT_special } from './special';

export type DictPtRange =
  | typeof DICT_PT_a_d
  | typeof DICT_PT_e_h
  | typeof DICT_PT_i_l
  | typeof DICT_PT_m_p
  | typeof DICT_PT_q_t
  | typeof DICT_PT_u_z
  | typeof DICT_PT_special
;

export const ALL_PT_RANGES: DictPtRange[] = [
  DICT_PT_a_d,
  DICT_PT_e_h,
  DICT_PT_i_l,
  DICT_PT_m_p,
  DICT_PT_q_t,
  DICT_PT_u_z,
  DICT_PT_special,
];

export const TOTAL_PT_ENTRIES = 15000;
