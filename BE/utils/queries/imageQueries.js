const imageQueries = {
  insertImage: `insert ignore into Images (image_type, image_name, image_name_kr, image_url) values (?,?,?,?)`,

  selectItemCount: `select count(*) as cnt from Images where image_name = ?`,

  selectImage: `select image_type, image_name,image_name_kr, image_url from Images where image_name in`,

  selectCompanionCount: `select count(*) as cnt from Images where image_url = ?`,
};

export default imageQueries;
