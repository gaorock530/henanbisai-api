import SetupInterface from '@/interface/setup.interface';
import { v4 } from 'uuid';

export default class Setup implements SetupInterface {
  id: string;
  key: string;
  value: string;
  effectivePeriod?: [Date, Date];

  constructor(entry: SetupInterface) {
    this.id = v4();
    this.key = entry.key;
    this.value = entry.value;
    if (entry.effectivePeriod) this.effectivePeriod = entry.effectivePeriod;
  }
}
