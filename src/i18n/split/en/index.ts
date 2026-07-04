// EN - Índice de todos os ranges
// Gerado automaticamente por split-dictionaries.ts

import { DICT_EN_a_d } from './a-d';
import { DICT_EN_e_h } from './e-h';
import { DICT_EN_i_l } from './i-l';
import { DICT_EN_m_p } from './m-p';
import { DICT_EN_q_t } from './q-t';
import { DICT_EN_u_z } from './u-z';
import { DICT_EN_special } from './special';

export type DictEnRange =
  | typeof DICT_EN_a_d
  | typeof DICT_EN_e_h
  | typeof DICT_EN_i_l
  | typeof DICT_EN_m_p
  | typeof DICT_EN_q_t
  | typeof DICT_EN_u_z
  | typeof DICT_EN_special
;

export const ALL_EN_RANGES: DictEnRange[] = [
  DICT_EN_a_d,
  DICT_EN_e_h,
  DICT_EN_i_l,
  DICT_EN_m_p,
  DICT_EN_q_t,
  DICT_EN_u_z,
  DICT_EN_special,
];

export const TOTAL_EN_ENTRIES = 15000;
