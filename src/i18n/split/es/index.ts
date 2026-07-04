// ES - Índice de todos os ranges
// Gerado automaticamente por split-dictionaries.ts

import { DICT_ES_a_d } from './a-d';
import { DICT_ES_e_h } from './e-h';
import { DICT_ES_i_l } from './i-l';
import { DICT_ES_m_p } from './m-p';
import { DICT_ES_q_t } from './q-t';
import { DICT_ES_u_z } from './u-z';
import { DICT_ES_special } from './special';

export type DictEsRange =
  | typeof DICT_ES_a_d
  | typeof DICT_ES_e_h
  | typeof DICT_ES_i_l
  | typeof DICT_ES_m_p
  | typeof DICT_ES_q_t
  | typeof DICT_ES_u_z
  | typeof DICT_ES_special
;

export const ALL_ES_RANGES: DictEsRange[] = [
  DICT_ES_a_d,
  DICT_ES_e_h,
  DICT_ES_i_l,
  DICT_ES_m_p,
  DICT_ES_q_t,
  DICT_ES_u_z,
  DICT_ES_special,
];

export const TOTAL_ES_ENTRIES = 15000;
