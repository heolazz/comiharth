const paramNames = [
  'genre', 'genres', 'genreId', 'genreIds', 'genre_id', 'genre_ids',
  'tag', 'tags', 'tagId', 'tagIds', 'tag_id', 'tag_ids',
  'category', 'categories', 'categoryId', 'categoryIds', 'category_id', 'category_ids',
  'type', 'types'
];
const formats = [
  (key, val) => `${key}=${val}`,
  (key, val) => `${key}[]=${val}`,
  (key, val) => `${key}[0]=${val}`
];
const values = ['19', 'action', 'Action', 'Action', 'ACTION'];

async function test() {
  let count = 0;
  for (const name of paramNames) {
    for (const fmt of formats) {
      for (const val of values) {
        const query = fmt(name, val);
        try {
          const res = await fetch('https://be.komikcast.cc/series?' + query);
          const json = await res.json();
          if (json.meta && json.meta.total > 0 && json.meta.total < 10000) {
            console.log('SUCCESS:', query, 'Total:', json.meta.total);
          }
        } catch(e) {}
      }
    }
  }
  console.log('Done scanning.');
}
test();
