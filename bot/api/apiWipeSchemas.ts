import { schemaList } from '../../app/dashboard/_assets/constans';
import { deleteSchema } from '../lib/mysql';

export const apiWipeSchemas = async (): Promise<boolean> => {
  for await (const schema of schemaList) {
    await deleteSchema(schema);
  }

  return true;
};
