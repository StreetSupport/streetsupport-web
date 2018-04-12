export class WordPress {
  constructor () {
    const WPAPI = require('wpapi')

    // TODO: Put URL into config
    const apiPromise = WPAPI.discover('https://news.streetsupport.net/wp-json')
    this.api = apiPromise.then((site) => {
      return site
    }).catch((error) => {
      console.error('Wordpress Autodiscovery Error')
      console.error(error)
      return null
    })
  }

  getPostsByTag (tag, limit, offset) {
    if (this.api === null) {
      console.log('No API')
      return []
    }
    const collection = this.api.tags().slug(tag)
      .then((tags) => {
        console.log(tags)
        // .slug() queries will always return as an array
        const currentTag = tags[0]
        let query = this.api.posts()
        if (limit !== null) {
          query = query.perPage(limit)
        }
        if (offset !== null) {
          query = query.offset(offset)
        }
        return query.tags(currentTag.id)
      })
      .then((posts) => {
        return posts
      })
      .catch((error) => {
        console.error('WordPress Tag Query Error')
        console.error(error)
        return []
      })

    console.log(collection)
    return collection
  }

  getPostsByCategory (category, limit, offset) {
    if (this.api === null) {
      return []
    }

    return this.api.categories().slug(category)
      .then((categories) => {
        // .slug() queries will always return as an array
        const currentCategory = categories[0]
        let query = this.api.posts()
        if (limit !== null) {
          query = query.perPage(limit)
        }
        if (offset !== null) {
          query = query.offset(offset)
        }
        return query.tags(currentCategory.id)
      })
      .then((posts) => {
        return posts
      })
      .catch((error) => {
        console.error('WordPress Category Query Error')
        console.error(error)
        return []
      })
  }
}
