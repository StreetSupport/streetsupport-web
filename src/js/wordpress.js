const WPAPI = require('wpapi')
const apiRootJSON = require('../data/wp-endpoints.json')
const api = new WPAPI({
  endpoint: 'https://news.streetsupport.net/wp-json',
  // endpoint: apiRootJSON.url,
  routes: apiRootJSON.routes
});

// TODO: Put URL into config

function getPostsByTag(tag, limit, offset) {
  if (api === null) {
    console.log('No API')
    return []
  }
  return new Promise((resolve, reject) => {
    api.tags().slug(tag)
      .get((error, tags) => {
        if (error) {
          console.error('WordPress Tag Query Error')
          console.error(error)
          return []
        }

        // .slug() queries will always return as an array
        const currentTag = tags[0]
        let query = api.posts().tags(currentTag.id)
        if (limit !== null) {
          query = query.perPage(limit)
        }
        if (offset !== null) {
          query = query.offset(offset)
        }

        query.get((error, posts) => {
          if (error) {
            reject(error)
          }
          resolve(posts)
        })
      })
  })
}

function getPostsByCategory(category, limit, offset) {
  if (api === null) {
    return []
  }

  return new Promise((resolve, reject) => {
    api.categories().slug(category)
      .get((error, categories) => {
        if (error) {
          console.error('WordPress Category Query Error')
          console.error(error)
          return []
        }
        // .slug() queries will always return as an array
        const currentCategory = categories[0]
        let query = this.api.posts().categories(currentCategory.id)
        if (limit !== null) {
          query = query.perPage(limit)
        }
        if (offset !== null) {
          query = query.offset(offset)
        }

        query.get((error, posts) => {
          if (error) {
            reject(error)
            // return
          }
          resolve(posts)
        })
      })
  })
}

module.exports = {
  getPostsByTag: getPostsByTag,
  getPostsByCategory: getPostsByCategory
}
