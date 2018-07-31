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

function getPostsByLocation (location, limit, offset, resolveEmbedded) {
  if (api === null) {
    console.log('No API')
    return []
  }
  return new Promise((resolve, reject) => {
    api.locations().slug(location)
      .get((error, locations) => {
        if (error) {
          console.error('WordPress Taxonomy Query Error')
          console.error(error)
          return []
        }

        const currentLocation = locations[0]
        let query = api.posts().param('locations', currentLocation.id)
        if (typeof (resolveEmbedded) !== 'undefined' && resolveEmbedded === true) {
          query = query.embed()
        }
        if (typeof (limit) !== 'undefined') {
          query = query.perPage(limit)
        }
        if (typeof (offset) !== 'undefined') {
          query = query.offset(offset)
        }
        query.get((error, posts) => {
          if (error) {
            reject(error)
          }
          resolve({
            posts: processPosts(posts),
            taxonomy: currentLocation
          })
        })
      })
  })
}

function getPostsByTag (tag, limit, offset, resolveEmbedded) {
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
        if (typeof (resolveEmbedded) !== 'undefined' && resolveEmbedded === true) {
          query = query.embed()
        }
        if (typeof (limit) !== 'undefined') {
          query = query.perPage(limit)
        }
        if (typeof (offset) !== 'undefined') {
          query = query.offset(offset)
        }
        query.get((error, posts) => {
          if (error) {
            reject(error)
          }
          resolve({
            posts: processPosts(posts),
            taxonomy: currentTag
          })
        })
      })
  })
}

function getPostsByCategory (category, limit, offset, resolveEmbedded) {
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
        if (typeof (resolveEmbedded) !== 'undefined' && resolveEmbedded === true) {
          query = query.embed()
        }
        if (typeof (limit) !== 'undefined') {
          query = query.perPage(limit)
        }
        if (typeof (offset) !== 'undefined') {
          query = query.offset(offset)
        }
        query.get((error, posts) => {
          if (error) {
            reject(error)
            // return
          }
          resolve({
            posts: processPosts(posts),
            taxonomy: currentCategory
          })
        })
      })
  })
}

function processPosts (posts) {
  return _.map(posts, (postItem) => {
    postItem.date_gmt_object = moment(postItem.date_gmt)
    postItem.date_local_formatted = postItem.date_gmt_object.local().format('DD/MM/YYYY')
    postItem.date_local_iso = postItem.date_gmt_object.local().toISOString(true)

    // TODO Experiment with built in trunc function
    postItem.short_excerpt = _.truncate(striptags(postItem.excerpt.rendered), {
      'length': 100
    })

    if (typeof (postItem._embedded) !== 'undefined') {
      postItem.author_object = typeof (postItem._embedded['author']) !== 'undefined'
        ? postItem._embedded['author'][0]
        : null

      // TODO: Investigate Image Sizes in WP Admin
      if (typeof (postItem._embedded['wp:featuredmedia']) !== 'undefined') {
        postItem.featured_media_object = postItem._embedded['wp:featuredmedia'][0]

        postItem.featured_media_object.srcset = ''
        if (Object.getOwnPropertyNames(postItem.featured_media_object.media_details.sizes).length !== 0) {
          var srcset = []
          _.each(postItem.featured_media_object.media_details.sizes, function (sizeItem) {
            srcset.push(`${sizeItem.source_url} ${sizeItem.width}w`)
          })
          postItem.featured_media_object.srcset = srcset.join(', ')
        }
      }

      if (typeof (postItem._embedded['wp:term']) !== 'undefined') {
        postItem.tags = postItem._embedded['wp:term'][1]
        postItem.categories = postItem._embedded['wp:term'][0]
        postItem.locations = postItem._embedded['wp:term'][2]
      }
    }

    return postItem
  })
}

module.exports = {
  getPostsByLocation: getPostsByLocation,
  getPostsByTag: getPostsByTag,
  getPostsByCategory: getPostsByCategory
}
