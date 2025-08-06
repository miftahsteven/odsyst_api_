const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { menu } = require(".");
const { text } = require("body-parser");
const path = require("path");
const {saveLog} = require("../helper/log")

const filterObject = (obj, filter, filterValue) => 
  Object.keys(obj).reduce((acc, val) => 
  (obj[val][filter] === filterValue ? acc : {
      ...acc,
      [val]: obj[val]
  }                                        
), {});

module.exports = {
  async getMenu(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      const menus = await prisma.menu.findMany({      
          select : {
              id: true,
              menu_text: true,
              path: true,        
              icon: true,
              notification: true,
              menu: {
                  select : {
                      menu_text: true
                  }
              }      
          },
          where : {
              isparent:0
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      const menuResult = await Promise.all(
        menus.map(async (item) => {
            return {
                id: item.id,
                name: item.menu_text,
                path: item.path,
                parent: item.menu.menu_text,
                icon: item.icon,
                notification: item.notification
            }
        })
      )

      return res.status(200).json({
        message: "Sukses",
        data: menuResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getMenuStructure(req, res) {
    try {
      const userId = req.user_id;
      const typeId = req.user.user_type;
      //const roleId = req.user_type.id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "id";

      console.log("TYPE: ", userId);

      const menus = await prisma.menu.findMany({      
        select : {
              id: true,
              menu_text: true,
              path: true,        
              icon: true,
              notification: true,
              menu: {
                  select : {
                      menu_text: true
                  }
              }      
          },
          where : {
              isparent:1
          },          
          // orderBy: {
          //   [sortBy]: sortType,
          // },
      });

      console.log("MENUSS", JSON.stringify(menus));

      const menuResult = await Promise.all(
        menus.map(async (item) => {
            
            const menusChild = await prisma.role_menu.findMany({      
                select : {
                    id: true,                                
                    menu: {
                        select: {
                            id: true,
                            menu_text: true,
                            path: true,
                            icon: true,
                            parent_id: true,
                            notification: true                            
                        }
                    },
                    // user_type : {
                    //       select: {
                    //           id: true,
                    //           type_name: true
                    //       }
                    // }
                },
                where : {
                   AND : [
                      {
                          menu : {parent_id: item.id} 
                      },
                      {
                          menu : {isparent: 0} 
                      },
                      {
                          role_id: typeId
                      }
                   ]                   
                }
            });

          // menusChild.map(async(itemchild) => {
          //     const menuStructureChild = {
          //         idnum: itemchild.menu.id,
          //         id: (itemchild.menu.menu_text).replace(/\s/g,''),
          //         name: itemchild.menu.menu_text,
          //         path: itemchild.menu.path,
          //         icon: itemchild.menu.icon,
          //         notification: itemchild.menu.notification
          //     }
          // })

          const menuParent =  {
            [(item.menu.menu_text).replace(/\s/g,'')] : {
              idnum: item.id,
              id: (item.menu.menu_text).replace(/\s/g,''),
              text: item.menu.menu_text,              
              path: item.menu.path,
              icon: item.menu.icon,
              notification: item.menu.notification,
              subMenu: {[(item.menu.menu_text).replace(/\s/g,'')+item.id] : menusChild},//item.menu.menu_text,           
            } 
          }

          //let arrayFinal = []

          // const menuParent =  {
          //     idnum: item.id,
          //     id: (item.menu.menu_text).replace(/\s/g,''),
          //     text: item.menu.menu_text,              
          //     path: item.menu.path,
          //     icon: item.menu.icon,
          //     notification: item.menu.notification,
          //     subMenu: {[(item.menu.menu_text).replace(/\s/g,'')+item.id] : menusChild},                          
          // }

          //arrayFinal.push(menuParent)
          
            
          return menuParent;
        })
      )

      return res.status(200).json({
        message: "Sukses",
        data: menuResult,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getMenuAdminFinal (req, res) {

    const userId = req.user_id;
    const typeId = req.user.user_type;
    //const roleId = req.user_type.id;
    const sortType = req.query.order || "desc";
    const sortBy = req.query.sortBy || "id";

      try {

        const menus = await prisma.menu.findMany({      
          select : {
                id: true,
                menu_text: true,
                path: true,        
                icon: true,
                notification: true,
                isparent: true,
                parent_id: true,
                role_menu: true,
                menu_category: true,
                menu: {
                    select : {
                        menu_text: true
                    }
                }      
            },
            // where : {
            //     menu_category: 0
            // },                      
        });

        console.log("MENUSS1", JSON.stringify(menus));

        const menuAdmin = {}

        //const menuResult = await Promise.all(            
            menus.filter(datafilter => datafilter.isparent == 1).map(  (items) => {  
            
            //console.log("MENUSSFINAL", menus.filter(itemdata => itemdata.isparent == 0 && itemdata.parent_id == items.id));
              const checkchildren = menus.filter(itemdata => itemdata.isparent == 0 && itemdata.parent_id == items.id && itemdata.role_menu.some(itemrole => itemrole.role_id == typeId));
              if (checkchildren.length > 0) {
                  let menuSub = {}                  
                  menuAdmin[items.menu_text.replace(/\s/g,'')] = {
                    idnum: items.id,
                    id: (items.menu.menu_text).replace(/\s/g,''),
                    text: items.menu.menu_text,              
                    path: items.path?? "",
                    icon: items.icon?? "",
                    category: items.menu_category?? 0,
                    notification: items.menu.notification?? Boolean(false),                   
                  }      
                  
                  let dataanakvalue = menus.filter(itemdata => itemdata.isparent == 0 &&  itemdata.parent_id == items.id && itemdata.role_menu.some(itemrole => itemrole.role_id == typeId));

                  menuAdmin[items.menu_text.replace(/\s/g,'')].subMenu = {};                  

                  for (const property in dataanakvalue) {
                    //console.log(`${property}: ${dataanakvalue[property]}`);
                    menuAdmin[items.menu_text.replace(/\s/g,'')].subMenu[dataanakvalue[property].menu_text.replace(/\s/g,'')+dataanakvalue[property].id] = {
                        idnum: dataanakvalue[property].id,
                        id: (dataanakvalue[property].menu_text).replace(/\s/g,''),
                        text: dataanakvalue[property].menu_text,
                        path: dataanakvalue[property].path,
                        notification: dataanakvalue[property].notification,
                        icon: dataanakvalue[property].icon
                    }
                  }
                } else {
                  //just continue
                  //console.log("ADA CHILDREN", JSON.stringify(checkchildren));
                  let menuSub = {}
                }
                  
            })       
      
        return res.status(200).json({
          message: "Sukses",
          data: { menuAdmin },
        });

      } catch (e) {

        return res.status(500).json({
          error: true,
          message: e?.message,
        });

      }

  },  

  async getRoleMenu(req, res) {
    try {
      const userId = req.user_id;
      const sortType = req.query.order || "desc";
      const sortBy = req.query.sortBy || "role_id";

      const roleMenus = await prisma.role_menu.findMany({          
          select : {
              id: true,            
              user_type : true,
              menu: {
                  select: {
                      id: true,
                      menu_text: true,
                      path: true,
                      icon: true,
                      parent_id: true,
                      notification: true,
                      menu : {
                          select : {
                              menu_text: true
                          }
                      }
                  }
              },
              user_type : {
                  select: {
                      id: true,
                      type_name: true
                  }
              }
          },
          orderBy: {
            [sortBy]: sortType,
          },
      });

      const roleMenusResults = await Promise.all(
        roleMenus.map(async (item) => {
            return {
                id: item.id,
                type_id: item.user_type.id,
                menu_id: item.menu.id,
                parent: item.parent_id,
                name: item.menu.menu_text,
                role: item.user_type.type_name,
                path: item.menu.path,
                icon: item.menu.icon,              
                parent: item.menu.menu.menu_text  
            }
        })
      )

      return res.status(200).json({
        message: "Sukses Ambil Data Role Menu",
        data: roleMenusResults,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async createMenuRole(req, res) {
    try {
      const userId = req.user_id;
      
      const { menu_id, role_id } = req.body;

      if (!menu_id || !role_id) {
        return res.status(400).json({
          message: "menu dan Role Tidak Boleh Kosong",
        });
      }

      const checkDataRoleMenu = await prisma.role_menu.findFirst({
        where : {
           // OR : { role_id : Number(role_id) },{ menu_id: Number(menu_id) }
           AND : [
            {role_id : Number(role_id)}, 
            {menu_id: Number(menu_id)}
          ]
        }
      })
      //console.log('CEK DATA UNIQ : ', JSON.stringify(checkDataRoleMenu));
      if (checkDataRoleMenu) {
        return res.status(405).json({
          message: "Data Sudah Ada",
        });
      }

      const dataBaru = await prisma.role_menu.create({
        data: {
          menu_id: Number(menu_id),
          role_id: Number(role_id)
        },
      });

      const savelog =  saveLog({user_id: userId, activity: `Register New Role Menu : Menu Id ${menu_id} Ke Role Id ${role_id} `, route: 'role/tambah-role-menu'});

      res.status(200).json({
        message: "Sukses Membuat Role Menu Baru",
        data: dataBaru
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async updateMenuRole(req, res) {
    try {
      const userId = req.user_id;
      
      const { id, menu_id, role_id } = req.body;

      if (!menu_id || !role_id) {
        return res.status(400).json({
          message: "menu dan Role Tidak Boleh Kosong",
        });
      }

      const checkDataRoleMenu = await prisma.role_menu.findFirst({
        where : {
           // OR : { role_id : Number(role_id) },{ menu_id: Number(menu_id) }
           AND : [
            {role_id : Number(role_id)}, 
            {menu_id: Number(menu_id)}
          ]
        }
      })
      //console.log('CEK DATA UNIQ : ', JSON.stringify(checkDataRoleMenu));
      if (checkDataRoleMenu) {
        return res.status(405).json({
          message: "Data Sudah Ada",
        });
      }

      const dataBaru = await prisma.role_menu.update({
        data: {
          menu_id: Number(menu_id),
          role_id: Number(role_id)
        },
        where :  {
            id: Number(id)
        }
      });

      const savelog =  saveLog({user_id: userId, activity: `Update Role Menu : Menu Id ${menu_id} Ke Role Id ${role_id} `, route: 'role/update-role-menu'});

      res.status(200).json({
        message: "Sukses Mengupdate Role Menu",
        data: dataBaru
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async removeRoleMenu(req, res) {
    try {
      const id = req.body.id;

      if (!id) {
        return res.status(400).json({
          message: "ID tidak boleh kosong"
        });
      }

      await prisma.role_menu.delete({
        where: {
          id: Number(id),
        },        
      });

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Hapus User",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
