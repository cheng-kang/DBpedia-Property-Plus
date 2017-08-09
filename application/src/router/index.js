import Vue from 'vue'
import Router from 'vue-router'
import HomePage from '@/components/HomePage'
import MainPage from '@/components/MainPage'
import EntryPage from '@/components/EntryPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'HomePage',
      component: HomePage
    },
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/entry/:name',
      name: 'EntryPage',
      component: EntryPage
    }
  ]
})
