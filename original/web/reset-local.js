export async function resetLocalData(clearJournal,storage){await clearJournal();for(const key of Object.keys(storage))if(key.startsWith('miaoye-'))storage.removeItem(key);}
