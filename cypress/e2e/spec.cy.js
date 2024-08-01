describe('My First Test', () => {
  it('Visits the Login Page and Enters Credentials', () => {
    // 访问登录页面
    cy.visit('http://localhost:3000/login')

    // 输入 email 和 password
    cy.get('#email').type('tutor_1@ad.au')
    cy.get('#password').type('admin123')

    // 使用按钮的 id 选择并点击登录按钮
    cy.get('#buttonLogin').click()

    // 验证是否跳转到预期的页面
    cy.url().should('include', '/project/allproject')

    // 搜索框输入
    cy.get('Input').type('Cloud').should('have.value', 'Cloud')

    //点击filter按钮
    cy.contains('button', 'Filter').click()

    //点击搜索后的项目
    cy.get('.custom-card-header').click()
    
    //点击Allocatedteams按钮
    cy.contains('button', 'Allocated Teams').click()

    //点击team
    cy.contains('p.MuiTypography-root', 'TeamId: 207003').click()

    //打分
    cy.get('.ant-btn.ant-btn-primary')
    .filter((index, element) => {
      return element.querySelector('.anticon-star') !== null;
    })
    .click({ force: true })
    
    cy.get('#grade-Sprint\\ 1')
      .clear()
      .type('95')
    cy.get('#comment-Sprint\\ 1')
      .clear()
      .type('good')
    cy.get('#grade-Sprint\\ 2')
      .clear()
      .type('97')
    cy.get('#comment-Sprint\\ 2')
      .clear()
      .type('good')
    cy.get('#grade-Sprint\\ 3')
      .clear()
      .type('99')
    cy.get('#comment-Sprint\\ 3')
      .clear()
      .type('good')
    cy.contains('button', 'Save').click()

    //查看得分
    cy.get('button .anticon-file-text').click()
    
    //点击消息
    cy.contains('a', 'Notification').click()

    // 验证点击后的行为，例如页面是否跳转到 /notification
    cy.url().should('include', '/notification')

    //点击team
    cy.contains('a', 'Team').click()

    // 验证点击后的行为，例如页面是否跳转到/team/tutor
    cy.url().should('include', '/team/tutor')
    
    //搜索框检查
    cy.get('input[placeholder="Search Team"]')
      .clear()
      .type('team_7')

    // 验证输入内容是否正确
    cy.get('input[placeholder="Search Team"]').should('have.value', 'team_7')

    //点击filter按钮并且清除
    cy.contains('button', 'Filter').click()
    
    //区分COMP9900和COMP3900
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()

    //Tutor查看student list
    cy.contains('button', 'STUDENT LIST').click()

    //Tutor查看student信息
    cy.get('input[placeholder="Search Student"]')
      .clear()
      .type('3')
    cy.get('input[placeholder="Search Student"]').should('have.value', '3')
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()

    //Tutor查看Unallocated Team List
    cy.contains('button', 'UNALLOCATED TEAMS').click()
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()
    cy.get('input[placeholder="Search Unallocated Team"]')
      .clear()
      .type('4')
    cy.get('input[placeholder="Search Unallocated Team"]').should('have.value', '4')

    //Message功能
    cy.contains('a', 'Message').click()
    cy.url().should('include', '/message')
    cy.get('button.ant-btn-primary.list-item-button').contains('+ New Channel').click()
    cy.get('input[placeholder="Search by name or email"]')
      .clear()
      .type('s')
    cy.get('input.ant-checkbox-input[value="11"]').click()

    //发送信息
    cy.get('input.ant-checkbox-input[value="11"]').should('be.checked')
    cy.contains('button', 'Invite').click()
    cy.get('input#exampleFormControlInput2')
      .clear()
      .type('Test{enter}')

    // 验证输入内容是否正确
    cy.get('input#exampleFormControlInput2').should('have.value', 'Test')

    //发送名片
    cy.get('button.MuiButtonBase-root.MuiIconButton-root.circle-buttonshare').click()
    cy.get('input.ant-radio-input[value="8"]').click()
    cy.contains('button', 'Share').click()
    
    //群聊功能
    cy.get('button.ant-btn-primary.list-item-button').contains('+ New Channel').click()
    cy.get('input[placeholder="Search by name or email"]')
      .clear()
    cy.get('input.ant-checkbox-input[value="2"]').click()
    cy.get('input.ant-checkbox-input[value="3"]').click()
    cy.contains('button', 'Invite').click()
    cy.get('input#exampleFormControlInput2')
      .clear()
      .type('Test{enter}')
    
    //查看群成员
    cy.get('button.MuiButtonBase-root.MuiIconButton-root.group-icon-button').click()
    cy.get('.ant-modal-wrap').last().find('svg[data-icon="close"]').click({ force: true })

    //群邀请
    cy.contains('button', '+ Invite').click()
    cy.contains('button', 'Cancel').click()

    //切换频道
    cy.get('button.ant-btn-primary.list-item-button').contains('span', 'All Channel').click()
    cy.contains('li.ant-list-item', 'Private Chat: tutor_1 and Lisa0').click()

    //清除消息
    cy.contains('a', 'Notification').click()
    cy.get('button.ant-btn-primary')
      .find('span[role="img"][aria-label="close"]')
      .click({ force: true })
    cy.contains('button.ant-btn-primary.ant-btn-dangerous', 'Clear').click({ force: true })

    //编辑profile
    cy.contains('a', 'Profile').click()
    cy.get('button.MuiButtonBase-root.MuiButton-root.MuiButton-containedPrimary')
      .contains('Edit')
      .click()
    cy.get('textarea.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline')
      .first()
      .clear()
      .type('Hello everyone！')

    // 验证输入后的文本内容
    cy.get('textarea.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline')
      .first()
      .should('have.value', 'Hello everyone！')
    
    //保存
    cy.get('button.MuiButtonBase-root.MuiButton-root.MuiButton-containedPrimary')
      .contains('Save')
      .click()
    
  })
})