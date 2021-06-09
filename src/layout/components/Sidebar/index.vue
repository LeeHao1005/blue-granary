<template>
  <div class="scrollbar-wrapper" >
<!--    <logo v-if="showLogo" :collapse="isCollapse" class="loge-wrapper"/>-->
    <div class="loge-wrapper"></div>
    <el-scrollbar >
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        :default-openeds="['/system']"
        mode="vertical"
        class="scrollbar-wrapper"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
<style>
.scrollbar-wrapper{
  background-image: url("../../../icons/photo/menuBJ.jpg");
}
.loge-wrapper{
  height: 36px;
  width: 185px;
  background-image: url("../../../icons/photo/LOGO@NAME-X.png");
}

</style>
