var tableData = [];
var editForm = document.getElementById("student-edit-form");
var modal = document.getElementsByClassName('modal')[0];
var tBody = document.getElementById('tBody');
var nowPage = 1;
var pageSize = 5;
var allPage = 1;
// 为页面添加事件
function bindEvent(){
    var menuList = document.getElementsByClassName("menu")[0];
    menuList.onclick = function(e){
        if(e.target.tagName == 'DD'){
            // 循环菜单栏,使所有含有active的元素的class去掉
            changeStyle(e.target);
            //对应的右侧内容显示出来并且让其他内容隐藏
            var id = e.target.getAttribute("data-id");
            var showContent = document.getElementById(id);
            changeStyle(showContent);
        } else {
            return false;
        }
    }

    var studentAddBtn = document.getElementById("student-add-submit");
    studentAddBtn.onclick = function(e){
        // 获取新增表单数据
        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
        if(data){
            transferData('/api/student/addStudent', data, function(){
                alert("新增学生成功");
                var form = document.getElementById("student-add-form");
                form.reset();
                getTableData();
                var studentListDom = menuList.getElementsByTagName("DD")[0];
                studentListDom.click();
            })
        };
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
                    getTableData();
                })
            }
        }
    }

    // 编辑学生的提交按钮
    var studentEditBtn = document.getElementById("student-edit-submit");
    studentEditBtn.onclick = function(e){
        e.preventDefault();
        var data = getFormData(editForm);
        if(data){
            transferData("/api/student/updateStudent", data, function(){
                alert("修改成功");
                modal.style.display = 'none';
                getTableData();
            })
        }
    }
    modal.onclick = function(){
        modal.style.display = 'none';
    }
    var modalContent = modal.getElementsByClassName("modal-content")[0];
    modalContent.onclick = function(e){
        e.stopPropagation();
    }

    // 为翻页添加事件
    var turnPage = document.getElementsByClassName("turn-page")[0];
    turnPage.onclick = function(e){
        if(e.target.id == 'next-btn'){ // 下一页
            nowPage ++;
            getTableData();
        } else if(e.target.id == 'prev-btn'){
            nowPage --;
            getTableData();
        }
    }

}

// 获取所有的兄弟节点
function getSiblings(node){
    var parent = node.parentNode;
    var children = parent.children;
    var result = [];
    for(var i = 0; i < children.length; i++){
        if(children[i] != node){
            result.push(children[i]);
        }  
    }
    return result;
}

// 左右两边切换的样式功能
function changeStyle(node){
    var siblingsMenu = getSiblings(node);
    for(var j = 0;j < siblingsMenu.length; j++){
        siblingsMenu[j].classList.remove("active");
    }
    node.classList.add("active");
}

// 获取表单数据
function getFormData(form){
    var name = form.name.value;
    var sex = form.sex.value;
    var number = form.sNo.value;
    var email = form.email.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;

    if(!name || !number || !email || !birth || !phone || !address){
        alert("信息填写不全,请检查后提交");
        return false;
    }

    // 学号 4-16位数字
    if(!/^\d{4,16}$/.test(number)){
        alert("学号应该为4-16位的数字");
        return false;
    }
    // 出生年份
    if(!/^(19||20)\d{2}$/.test(birth)){
        alert("出生年份应该在1900-2099年");
        return false;
    }
    // 手机号
    if(!/^\d{11}$/.test(phone)){
        alert("手机号应为11位数字");
        return false;
    }
    // 邮箱
    if(!/^\w+@\w+\.com$/.test(email)){
        alert("邮箱格式不正确");
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

// 数据交互函数
function transferData(url, data, success){
    data.appkey = 'user123456_1587700709234';
    var result = saveData('http://open.duyiedu.com' + url ,data)
    if(result.status == 'success'){
        success(result.data);
    } else {
        alert(result.msg);
    }
}

// 获取学生列表数据
function getTableData(){
    transferData('/api/student/findByPage',{
        page: nowPage, // 当前第几页
        size: pageSize // 一页展示的条数
    },function(data){
        tableData = data.findByPage;
        allPage = Math.ceil(data.cont / pageSize); // 一共几页(举例：一共13条数据，一页显示5条，应当显示3页)
        renderTable(data.findByPage);
    })
}

// 渲染表格数据
function renderTable(data){
    var str = '';
    data.forEach(function(item,index){
        str += `<tr>
            <td>${item.sNo}</td>
            <td>${item.name}</td>
            <td>${item.sex == 0 ? '男': '女'}</td>
            <td>${item.email}</td>
            <td>${new Date().getFullYear() - item.birth}</td>
            <td>${item.phone}</td>
            <td>${item.address}</td>
            <td>
                <button class="edit btn" data-index=${index}>编辑</button>
                <button class="del btn" data-index=${index}>删除</button>
            </td>
        </tr>`
    });
    var nextPage = document.getElementById("next-btn");
    var prevPage = document.getElementById("prev-btn");
    tBody.innerHTML = str;
    if(nowPage < allPage){
        nextPage.style.display = 'inline-block';
    } else {
        nextPage.style.display = 'none';
    }
    if(nowPage > 1){
        prevPage.style.display = 'inline-block';
    } else {
        prevPage.style.display = 'none';
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

bindEvent();
getTableData();
document.getElementsByClassName("active")[0].click();


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
    } else if (typeof param == 'object'){
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

var data = saveData('http://open.duyiedu.com/api/student/findAll',{
    appkey:'user123456_1587700709234'
})