// Common modules
import '../../common'
const templating = require('../../template-render')
const wp = require('../../wordpress')

// add tag for volunteer for good news
const initNews = function () {
  const totalPostsToShow = 3
  wp
    .getPostsByTag('volunteer-for-good', totalPostsToShow, 0, true)
    .then((result) => {
      if (result.posts.length === totalPostsToShow) {
        result.taxonomy.name = 'volunteer-for-good'
        result.taxonomy.link = 'https://news.streetsupport.net/tag/volunteer-for-good/'
        templating.renderTemplate('js-news-tpl', result, 'js-news-output')
      }
    })
}

initNews()
