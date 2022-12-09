'use strict';
const Base = require('./base');
module.exports = class extends Base {
  /*获取未写周报-部门（公司）人员列表，无分页，无搜索*/
  async getUnDepartmentMemberListAction() {
    let companyWeeklyList;
    let usernumList = [];
    let unWeeklyList = [];
    /*计算一周时间戳*/
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentDay = new Date().getDate();
    let currentTimeStamp = new Date(
      currentYear,
      currentMonth,
      currentDay,
      0,
      0,
      0
    ).getTime();
    let currentDayNum = new Date().getDay();
    if (currentDayNum == 0) currentDayNum = 7;
    let startWeekNum = currentDayNum - 1;
    let endWeekNum = 7 - currentDayNum + 1;
    let startWeekStamp = currentTimeStamp - 1000 * 3600 * 24 * startWeekNum;
    let endWeekStamp = currentTimeStamp + 1000 * (3600 * 24 * endWeekNum - 1);
    try {
      if (this.user.role == 2) {
        /*公司已填周报人数*/
        companyWeeklyList = await this.model('week')
          .where({
            company_id: this.user.company_id,
            time: { '>': startWeekStamp, '<': endWeekStamp },
            role: { '>=': 2 },
          })
          .select();
        if (companyWeeklyList.length > 0) {
          for (let i = 0; i < companyWeeklyList.length; i++) {
            usernumList[i] = companyWeeklyList[i].usernum;
          }
          if (usernumList.length > 0) {
            unWeeklyList = await this.model('user')
              .field(
                'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
              )
              .where({
                usernum: ['not in', usernumList],
                company_id: this.user.company_id,
                role: { '>=': 2 },
              })
              .order('role DESC')
              .select();
          }
        } else {
          unWeeklyList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              company_id: this.user.company_id,
              role: { '>=': 2 },
            })
            .order('role DESC')
            .select();
        }
      } else if (this.user.role == 3) {
        /*公司已填周报人数*/
        companyWeeklyList = await this.model('week')
          .where({
            company_id: this.user.company_id,
            department_id: this.user.department_id,
            time: { '>': startWeekStamp, '<': endWeekStamp },
            role: { '>=': 3 },
          })
          .select();
        if (companyWeeklyList.length > 0) {
          for (let i = 0; i < companyWeeklyList.length; i++) {
            usernumList[i] = companyWeeklyList[i].usernum;
          }
          unWeeklyList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              usernum: ['not in', usernumList],
              company_id: this.user.company_id,
              department_id: this.user.department_id,
              role: { '>=': 3 },
            })
            .order('role DESC')
            .select();
        } else {
          unWeeklyList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              company_id: this.user.company_id,
              department_id: this.user.department_id,
              role: { '>=': 3 },
            })
            .order('role DESC')
            .select();
        }
      }
      return this.success({
        companyWeeklyList: companyWeeklyList,
        unWeeklyList: unWeeklyList,
      });
    } catch (e) {
      return this.fail('服务器开小差');
    }
    // let list = this.post();
    // if(!list.page){ list.page = '1' }
    // if(!list.pagesize){ list.pagesize = '10' }
    // let usernumList = [];
    // for(let i = 0; i < list.usernumList.length; i++) {
    //     usernumList[i] = list.usernumList[i].usernum;
    // }
    // if(list.usernumList.length > 0){
    //     try {
    //         let unWeeklyList;
    //         if(this.user.role == 2){
    //             unWeeklyList = await this.model('user').where({
    //                 usernum: ['not in', usernumList],
    //                 company_id: this.user.company_id,
    //                 role: {'>=': this.user.role}
    //             }).order("role DESC").page(list.page, list.pagesize).countSelect();
    //         }else if(this.user.role == 3){
    //             unWeeklyList = await this.model('user').where({
    //                 usernum: ['not in', usernumList],
    //                 company_id: this.user.company_id,
    //                 department_id: this.user.department_id,
    //                 role: {'>=': this.user.role}
    //             }).order("role DESC").page(list.page, list.pagesize).countSelect();
    //         }
    //         return this.success(unWeeklyList);
    //     }catch(e){
    //         return this.fail('服务器开小差');
    //     }
    // }else{
    //     try {
    //         let departmentMemberList;
    //         if(this.user.role == 2 ){
    //             departmentMemberList = await this.model('user').where({
    //                 company_id: this.user.company_id,
    //                 role: {'>=': this.user.role}
    //             }).order("role DESC").page(list.page, list.pagesize).countSelect();
    //         }else if(this.user.role == 3){
    //             departmentMemberList = await this.model('user').where({
    //                 company_id: this.user.company_id,
    //                 department_id: this.user.department_id,
    //                 role: {'>=': this.user.role}
    //             }).order("role DESC").page(list.page, list.pagesize).countSelect();
    //         }
    //         return this.success(departmentMemberList);
    //     }catch(e){
    //         return this.fail('服务器开小差');
    //     }
    // }
  }
  /*获取部门人员列表-分页-搜索*/
  async getDepartmentMemberListAction() {
    let page = this.post('pageNum');
    let pagesize = this.post('pageSize');
    let searchContent = this.post('searchContent');
    if (!page) {
      page = '1';
    }
    if (!pagesize) {
      pagesize = '10';
    }
    try {
      let departmentMemberList;
      if (!searchContent) {
        if (this.user.role == 2) {
          departmentMemberList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, ' +
                'email, role, role_name, username, usernum,telephone'
            )
            .where({
              company_id: this.user.company_id,
              role: { '>=': this.user.role },
            })
            .order('department_id asc , role asc')
            .page(page, pagesize)
            .countSelect();
        } else {
          departmentMemberList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              company_id: this.user.company_id,
              department_id: this.user.department_id,
              role: { '>=': this.user.role },
            })
            .order('department_id asc , role asc')
            .page(page, pagesize)
            .countSelect();
        }
      } else {
        if (this.user.role == 2) {
          departmentMemberList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              'username|usernum|company_name|department_name': [
                'like',
                '%' + searchContent + '%',
              ],
              company_id: this.user.company_id,
              role: { '>=': this.user.role },
            })
            .order('department_id asc , role asc')
            .page(page, pagesize)
            .countSelect();
        } else {
          departmentMemberList = await this.model('user')
            .field(
              'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
            )
            .where({
              'username|usernum|company_name|department_name': [
                'like',
                '%' + searchContent + '%',
              ],
              company_id: this.user.company_id,
              department_id: this.user.department_id,
              role: { '>=': this.user.role },
            })
            .order('department_id asc , role asc')
            .page(page, pagesize)
            .countSelect();
        }
      }
      return this.success(departmentMemberList);
    } catch (e) {
      return this.fail('服务器开小差');
    }
  }
  /*获取部门人员列表-无分页-无搜索*/
  async getDepartmentMemberListNoPageAction() {
    try {
      let departmentMemberList;
      if (this.user.role == 2) {
        departmentMemberList = await this.model('user')
          .field(
            'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
          )
          .where({
            company_id: this.user.company_id,
            role: { '>=': this.user.role },
          })
          .select();
      } else if (this.user.role == 3) {
        departmentMemberList = await this.model('user')
          .field(
            'id, company_id, company_name, department_id, department_name, email, role, role_name, username, usernum,telephone'
          )
          .where({
            company_id: this.user.company_id,
            department_id: this.user.department_id,
            role: { '>=': this.user.role },
          })
          .select();
      }

      return this.success(departmentMemberList);
    } catch (e) {
      return this.fail('服务器开小差');
    }
  }
  /*获取公司下所有部门-无分页-有搜索*/
  async getAllDepartmentListAction() {
    if (this.user.role == 1) {
      let company_id = this.post('company_id');
      try {
        let department = await this.model('department')
          .where({
            company_id: company_id,
          })
          .select();
        return this.success(department);
      } catch (e) {
        return this.fail(e);
      }
    } else {
      let company_id = this.user.company_id;
      // let searchContent = this.post('searchContent');
      try {
        let department = await this.model('department')
          .where({
            company_id: company_id,
            // 'company_id|company_name|department_id|department_name': ["like", "%"+searchContent+"%"],
          })
          .select();
        return this.success(department);
      } catch (e) {
        return this.fail(e);
      }
    }
  }
  /*部门概览页-部门人数，未写周报人数，已写周报人数，历史周报人数*/
  async getBoardAction() {
    let departmentNumber;
    let alreadyWeeklyNumber;
    let companyNumber;
    let totalUserNumber;
    let totalWeeklyNumber;
    //时间戳
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let currentDay = new Date().getDate();
    let currentTimeStamp = new Date(
      currentYear,
      currentMonth,
      currentDay,
      0,
      0,
      0
    ).getTime();
    let currentDayNum = new Date().getDay();
    if (currentDayNum == 0) currentDayNum = 7;
    let startWeekNum = currentDayNum - 1;
    let endWeekNum = 7 - currentDayNum + 1;
    let startWeekStamp = currentTimeStamp - 1000 * 3600 * 24 * startWeekNum;
    let endWeekStamp = currentTimeStamp + 1000 * (3600 * 24 * endWeekNum - 1);

    try {
      if (this.user.role == 3) {
        departmentNumber = await this.model('user')
          .where({
            company_id: this.user.company_id,
            department_id: this.user.department_id,
          })
          .count('usernum');
        alreadyWeeklyNumber = await this.model('week')
          .where({
            company_id: this.user.company_id,
            department_id: this.user.department_id,
            time: { '>': startWeekStamp, '<': endWeekStamp },
            role: { '>=': this.user.role },
          })
          .count('usernum');
      } else if (this.user.role == 2) {
        departmentNumber = await this.model('user')
          .where({
            company_id: this.user.company_id,
          })
          .count('usernum');
        alreadyWeeklyNumber = await this.model('week')
          .where({
            company_id: this.user.company_id,
            time: { '>': startWeekStamp, '<': endWeekStamp },
            role: { '>=': this.user.role },
          })
          .count('usernum');
      } else if (this.user.role == 1) {
        companyNumber = await this.model('company').count('id');
        totalUserNumber = await this.model('user').count('usernum');
        totalWeeklyNumber = await this.model('week').count('id');
      }

      //自己历史周报
      let myWeeklyNumber = await this.model('week')
        .where({
          usernum: this.user.usernum,
          username: this.user.username,
        })
        .count('usernum');
      let data = {
        departmentNumber: departmentNumber,
        alreadyWeeklyNumber: alreadyWeeklyNumber,
        unWeeklyNumber: departmentNumber - alreadyWeeklyNumber,
        myWeeklyNumber: myWeeklyNumber,
      };
      let adminData = {
        companyNumber: companyNumber,
        totalUserNumber: totalUserNumber,
        totalWeeklyNumber: totalWeeklyNumber,
        myWeeklyNumber: myWeeklyNumber,
      };
      if (this.user.role == 2 || this.user.role == 3) {
        return this.success(data);
      } else if (this.user.role == 1) {
        return this.success(adminData);
      }
    } catch (e) {
      return this.fail(e);
    }
  }
};
