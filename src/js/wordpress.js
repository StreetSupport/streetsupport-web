// TODO: Write Tests

import moment from 'moment'

const WPAPI = require('wpapi')
const apiRootJSON = require('../data/wp-endpoints.json')
const api = new WPAPI({
  endpoint: 'https://news.streetsupport.net/wp-json',
  routes: apiRootJSON.routes
})
const _ = require('lodash')

// TODO: Enable Caching

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
          resolve(processPosts(posts))
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
          resolve(processPosts(posts))
        })
      })
  })
}

function processPosts(posts) {
  return _.map(posts, (postItem) => {
    postItem.date_gmt_object = moment(postItem.date_gmt)
    postItem.date_local_formatted = postItem.date_gmt_object.local().format('D MMM YYYY')
    postItem.date_local_iso = postItem.date_gmt_object.local().toISOString(true)
    getPostAuthor(postItem.author).then((author) => {
      return postItem.author_object = author
    })

    getPostFeaturedMedia(postItem.featured_media).then((media) => {
      return postItem.featured_media_object = media
    })

    // TODO: Resolve Tags
    // TODO: Resolve Categories

    console.log(postItem)

    return postItem
  })
}

function getPostFeaturedMedia(mediaId) {
  if (api === null) {
    return []
  }

  if (typeof mediaId !== 'number') {
    console.error('WordPress Media Error - ID must be a number');
    return []
  }

  return new Promise((resolve, reject) => {
    api.media().id(mediaId)
      .get((error, mediaItem) => {
        if (error) {
          reject(error)
        }
        resolve(mediaItem)
      })
  })
}

function getPostAuthor(authorId) {
  if (api === null) {
    return []
  }

  if (typeof authorId !== 'number') {
    console.error('WordPress Author Error - ID must be a number');
    return []
  }

  return new Promise((resolve, reject) => {
    api.users().id(authorId)
      .get((error, mediaItem) => {
        if (error) {
          reject(error)
        }
        resolve(mediaItem)
      })
  })
}

// function getPostTags(tagIds) {
//   if (api === null) {
//     return []
//   }
//
//   return new Promise
// }

module.exports = {
  getPostsByTag: getPostsByTag,
  getPostsByCategory: getPostsByCategory
}
