import { schemaCreateList, schemaDeleteList } from '../../app/dashboard/_assets/constans';
import { deleteSchema } from '../lib/mysql';

export const apiWipeSchemas = async (): Promise<boolean> => {
  const schemas = [...schemaDeleteList, ...schemaCreateList];
  for await (const schema of schemas) {
    await deleteSchema(schema);
  }

  return true;
};
