// TODO: Write Tests

import moment from 'moment'

const WPAPI = require('wpapi')
const apiRootJSON = require('../data/wp-endpoints.json')
const api = new WPAPI({
  endpoint: 'https://news.streetsupport.net/wp-json',
  routes: apiRootJSON.routes
})
const _ = require('lodash')
const striptags = require('striptags')

// TODO: Enable Caching
// TODO: Investigate requesting other image sizes

function getPostsByLocation(location, limit, offset) {
  if (api === null) {
    console.log('No API')
    return []
  }
  return new Promise((resolve, reject) => {
    api.taxonomies().taxonomy('locations')
      .get((error, locations) => {
        if (error) {
          console.error('WordPress Taxonomy Query Error')
          console.error(error)
          return []
        }

        const currentLocation = locations[0]
        let query = api.posts().param('locations', currentLocation.id).embed()
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
        let query = api.posts().tags(currentTag.id).embed()
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
        let query = this.api.posts().categories(currentCategory.id).embed()
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

    // TODO Experiment with built in trunc function
    postItem.short_excerpt = _.truncate(striptags(postItem.excerpt.rendered), {
      'length': 100
    })

    if (typeof(postItem._embedded) !== 'undefined') {
      postItem.author_object = typeof(postItem._embedded['author']) !== 'undefined'
        ? postItem._embedded['author'][0]
        : null

      postItem.featured_media_object = typeof(postItem._embedded['wp:featuredmedia']) !== 'undefined'
        ? postItem._embedded['wp:featuredmedia'][0]
        : null

      if (typeof(postItem._embedded['wp:term']) !== 'undefined') {
        postItem.tags = postItem._embedded['wp:term'][1]
        postItem.categories = postItem._embedded['wp:term'][0]
        postItem.locations = postItem._embedded['wp:term'][2]
      }
    }

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

module.exports = {
  getPostsByTag: getPostsByTag,
  getPostsByCategory: getPostsByCategory,
  getPostsByLocation: getPostsByLocation
}
