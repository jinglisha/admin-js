

var tableData = [];
var nowPage = 1;
var pageSize = 5;
var allPage = 1;
var editForm = document.getElementById('student-edit-form');
var modal = document.getElementsByClassName('modal')[0];
var tBody = document.getElementById('tBody');
// 为页面添加事件
function bindEvent() {
    var menuList = document.getElementsByClassName('menu')[0];
    menuList.onclick = function (e) {
        console.log(e.target.nodeName);
        if (e.target.tagName === 'DD') {
            // 循环菜单栏  使所有含有active的元素的class 去掉
            changeStyle(e.target)
            var id = e.target.getAttribute('data-id');
            // 对应的右侧内容显示出来并且让其他内容隐藏
            var showContent = document.getElementById(id);
            changeStyle(showContent)
        }
    }
    var studentAddBtn = document.getElementById('student-add-submit');
    studentAddBtn.onclick = function () {
        // 获取新增表单数据
        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
        if (data) {
            // 向后台发送数据进行存储   会返回存储成功状态  如果存储成功则返回status: success否则为fail
            transferData('/api/student/addStudent', data, function () {
                 // 保存成功  弹出弹框 充值表单 进行跳转
                alert('新增学生成功');
                var form = document.getElementById('student-add-form');
                form.reset();
                getTableData();
                var studentListDom = menuList.getElementsByTagName('dd')[0];
                studentListDom.click();
            })
        }
        return false;
    }
    // 实现编辑/删除的功能
    tBody.onclick = function (e) {
        // console.log(e.target)  判断当前点击的按钮是不是编辑按钮
        if (e.target.classList.contains('edit')) {
            modal.style.display = 'block';
            var index = e.target.dataset.index;
            // 将学生数据回填到编辑表单当中
            renderForm(tableData[index]);
        } else if (e.target.classList.contains('del')) {// 判断当前电机的按钮是删除按钮
            var isDel = confirm('确认删除？');
            if (isDel) {
                var index = e.target.dataset.index;
                transferData('/api/student/delBySno', {
                    sNo: tableData[index].sNo
                }, function () {
                    alert('删除成功');
                    getTableData()
                })
            }
        }
    }
    var stundentEditBtn = document.getElementById('student-edit-submit');
    // 编辑学生的提交按钮点击事件
    stundentEditBtn.onclick = function (e) {
        e.preventDefault()
        var data = getFormData(editForm);
        if (data) {
            transferData('/api/student/updateStudent', data, function () {
                alert('修改成功');
                modal.style.display = 'none';
                getTableData();
            })
        }
        // 如果你希望用return false阻止默认行为 那必须确定默认行为是在当前事件之后触发  return false 真整的含义是 组织后续的操作
        return false;
    }
    modal.onclick = function (e) {
        if (e.target == this) {
            modal.style.display = 'none';
        }
    }
    var turnPage = document.getElementsByClassName('turn-page')[0];
    // 为翻页按钮添加事件
    turnPage.onclick = function (e) {
        // 获取下一页的数据
        if (e.target.id == 'next-btn') {
            nowPage ++;
            getTableData()
            
        } else if (e.target.id == 'prev-btn') { // 获取上一页数据
            nowPage --;
            getTableData()
        }
    }
}
// 获取所有的兄弟节点
function getSiblings(node) {
    var parent = node.parentNode;
    var children = parent.children;
    var result = [];
    for (var i = 0; i < children.length; i++) {
        if (children[i] != node) {
            result.push(children[i]);
        }
    }
    return result;
}
// 左右两边切换样式功能
function changeStyle(node) {
    var siblingsMenu = getSiblings(node);
    for (var i = 0; i < siblingsMenu.length; i++) {
        siblingsMenu[i].classList.remove('active');
    }
    node.classList.add('active');
}

// 获取表单数据  
function getFormData(form) {

    var name = form.name.value;
    var sex = form.sex.value;
    var number = form.sNo.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    var email = form.email.value;
    // console.log(form, name, sex, number, birth, phone, address, email)
    if (!name || !number || !birth || !phone || !address || !email) {
        alert('信息填写不完全请检查后提交');
        return false;
    }
    if (!/^\d{4,16}$/.test(number)) {
        alert('学号应该为4-16位的数字');
        return false;
    }
    if (!/^(19|20)\d{2}$/.test(birth)) {
        alert('出生年份应该在1900-2099年');
        return false;
    }
    if (!/^\d{11}$/.test(phone)) {
        alert('手机号应为11位数字');
        return false;
    }
    if (!/^\w+@\w+\.com$/.test(email)) {
        alert('邮箱格式不正确');
        return false;
    }
    return {
        sNo: number,
        name: name,
        sex: sex,
        birth: birth,
        phone: phone,
        email: email,
        address: address
    }
}
// 编辑表单的回填  接受的参数是学生的信息
function renderForm(data) {
    for (var prop in data) {
        if (editForm[prop]) {
            editForm[prop].value = data[prop];
        }
    }
}
// 数据交互函数
function transferData(url, data, success) {
    data.appkey = "qiqiqi_1569759019786";
    var result = saveData('http://open.duyiedu.com' + url, data);
    if (result.status == 'success') {
       success(result.data)
    } else {
        alert(result.msg)
    }
}

// 获取学生列表数据
function getTableData() {
    transferData('/api/student/findByPage', {
        page: nowPage,
        size: pageSize
    }, function (data) {
        tableData = data.findByPage;
        allPage = Math.ceil(data.cont / pageSize);
        renderTable(data.findByPage);
    })
}
// 渲染表格数据
function renderTable(data) {
    var str = "";
    data.forEach(function (item, index) {
        str += `<tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男' : '女'}</td>
        <td>${item.email}</td>
        <td>${(new Date().getFullYear() - item.birth)}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="edit btn" data-index=${index}>编辑</button>
            <button class="del btn" data-index=${index}>删除</button>
        </td>
    </tr>`
    });
 
    var nextPage = document.getElementById('next-btn');
    var prevPage = document.getElementById('prev-btn');
    tBody.innerHTML = str;
    // 判断显示下一页按钮
    if (allPage > nowPage) {
        nextPage.style.display = 'inline-block';
    } else { 
        nextPage.style.display = 'none'
    }
    // 判断显示上一页的按钮
    if (nowPage > 1) {
        prevPage.style.display = 'inline-block';
    } else {
        prevPage.style.display = 'none'
    }
}


bindEvent();
// 手动触发学生列表点击事件
document.getElementsByClassName('active')[0].click()
getTableData()

// 向后端存储数据
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}

//  接口的使用  接口最好用自己的appkey   不要用老师的  
// var data = saveData('http://open.duyiedu.com/api/student/findAll', {
//     appkey: 'DuYimeiqi_1564986205860'
// });
// console.log(data)