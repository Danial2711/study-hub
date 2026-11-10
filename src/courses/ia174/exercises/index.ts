/**
 * Original exam-style problems written for this app, grouped by the four question types of the
 * IA174 written exam (describe, find the flaw, HW-style, security proof). They do not reproduce
 * the official worksheets, homeworks or their solutions; `ref` only points to related material.
 */
import type { Exercise } from '../../../platform/types';
import { s1, s2, s3 } from './symmetric';
import { s4, hashes, macs, ae } from './integrity';
import { grp, rsa, dl, sig, zk } from './publicKey';

export const exercises: Exercise[] = [...s1, ...s2, ...s3, ...s4, ...hashes, ...macs, ...ae, ...grp, ...rsa, ...dl, ...sig, ...zk];
