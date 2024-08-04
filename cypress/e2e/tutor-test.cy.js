describe('My First Test', () => {
  it('Visits the Login Page and Enters Credentials', () => {
    // Visit the login page
    cy.visit('http://localhost:3333/login')

    // Input Email and Password
    cy.get('#email').type('tutor1@unsw.edu')
    cy.get('#password').type('admin123')

    // Click on the Login button
    cy.get('#buttonLogin').click()

    // Verify that it directs to the expected page
    cy.url().should('include', '/project/allproject')

    // Search box input
    cy.get('Input').type('1').should('have.value', '1')

    //click filter button
    cy.get('button.ant-btn-primary.ant-btn-lg')
      .contains('Filter')
      .click()

    //Click on the item after searching
    cy.get('div.custom-card-header')
      .contains('h5.custom-card-title', 'Project 1')
      .click()
    
    // //click Allocatedteams button
    // cy.contains('button', 'Allocated Teams').click()

    // //click team
    // cy.contains('p.MuiTypography-root', 'TeamId: 114492').click()

    // //grade
    // cy.get('.ant-btn.ant-btn-primary')
    // .filter((index, element) => {
    //   return element.querySelector('.anticon-star') !== null;
    // })
    // .click({ force: true })
    
    // cy.get('#grade-Sprint\\ 1')
    //   .clear()
    //   .type('95')
    // cy.get('#comment-Sprint\\ 1')
    //   .clear()
    //   .type('good')
    // cy.get('#grade-Sprint\\ 2')
    //   .clear()
    //   .type('97')
    // cy.get('#comment-Sprint\\ 2')
    //   .clear()
    //   .type('good')
    // cy.get('#grade-Sprint\\ 3')
    //   .clear()
    //   .type('99')
    // cy.get('#comment-Sprint\\ 3')
    //   .clear()
    //   .type('good')
    // cy.contains('button', 'Save').click()

    // //View Score
    // cy.get('button .anticon-file-text').click()
    
    //click Notification
    cy.contains('a', 'Notification').click()

    // Validates the behaviour after a click, whether the page directs to the /notification
    cy.url().should('include', '/notification')

    //click team
    cy.contains('a', 'Team').click()

    // Validates the behaviour after a click, whether the page directs to the/team/tutor
    cy.url().should('include', '/team/tutor')
    
    //Search box checking
    cy.get('input[placeholder="Search Team"]')
      .clear()
      .type('1')

    // Verify that the input is correct
    cy.get('input[placeholder="Search Team"]').should('have.value', '1')

    //Click the filter button and clear 
    cy.contains('button', 'Filter').click()
    
    //Distinguish between COMP9900 and COMP3900
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()

    //Tutor check student list
    cy.contains('button', 'STUDENT LIST').click()

    //Tutor check student信息
    cy.get('input[placeholder="Search Student"]')
      .clear()
      .type('3')
    cy.get('input[placeholder="Search Student"]').should('have.value', '3')
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()

    //Tutor check Unallocated Team List
    cy.contains('button', 'UNALLOCATED TEAMS').click()
    cy.get('div[role="combobox"][id="course"]').click()
    cy.get('li[data-value="COMP3900"]').click()
    cy.get('li[data-value="COMP9900"]').click()
    cy.get('input[placeholder="Search Unallocated Team"]')
      .clear()
      .type('1')
    cy.get('input[placeholder="Search Unallocated Team"]').should('have.value', '1')

    //Message
    cy.contains('a', 'Message').click()
    cy.url().should('include', '/message')
    cy.get('button.ant-btn-primary.list-item-button').contains('+ New Channel').click()
    cy.get('input[placeholder="Search by name or email"]')
      .clear()
      .type('s')
    cy.get('input.ant-checkbox-input[value="2"]').click()

    //send message
    cy.get('input.ant-checkbox-input[value="2"]').should('be.checked')
    cy.contains('button', 'Invite').click()
    cy.get('input#exampleFormControlInput2')
      .clear()
      .type('Test{enter}')

    // Verify that the input is correct
    cy.get('input#exampleFormControlInput2').should('have.value', 'Test')

    //Give a name card
    cy.get('button.MuiButtonBase-root.MuiIconButton-root.circle-buttonshare').click()
    cy.get('input.ant-radio-input[value="4"]').click()
    cy.contains('button', 'Share').click()
    
    //Group Chat function
    cy.get('button.ant-btn-primary.list-item-button').contains('+ New Channel').click()
    cy.get('input[placeholder="Search by name or email"]')
      .clear()
    cy.get('input.ant-checkbox-input[value="2"]').click()
    cy.get('input.ant-checkbox-input[value="3"]').click()
    cy.contains('button', 'Invite').click()
    cy.get('input#exampleFormControlInput2')
      .clear()
      .type('Test{enter}')
    
    //View Group Members
    cy.get('button.MuiButtonBase-root.MuiIconButton-root.group-icon-button').click()
    cy.get('.ant-modal-wrap').last().find('svg[data-icon="close"]').click({ force: true })

    //group invitation
    cy.contains('button', '+ Invite').click()
    cy.contains('button', 'Cancel').click()

    //Switching channels
    cy.get('button.ant-btn-primary.list-item-button').contains('span', 'All Channel').click()
    cy.contains('li.ant-list-item', 'Private Chat: tutor1 and student1').click()

    // Edit profile
    cy.contains('a', 'Profile').click()
    cy.get('button.MuiButtonBase-root.MuiButton-root.MuiButton-containedPrimary')
      .contains('Edit')
      .click()
    cy.get('textarea.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline')
      .first()
      .clear()
      .type('Hello everyone！')

    // Validating text content after input
    cy.get('textarea.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputMultiline')
      .first()
      .should('have.value', 'Hello everyone！')
    
    //save
    cy.get('button.MuiButtonBase-root.MuiButton-root.MuiButton-containedPrimary')
      .contains('Save')
      .click()
    
    //Clear Notification
    cy.visit('http://localhost:3333/login')
    cy.get('#email').type('student1@unsw.edu')
    cy.get('#password').type('admin123')
  
    // Click on the Login button
    cy.get('#buttonLogin').click()
    cy.url().should('include', 'project/allproject')

    cy.contains('a', 'Notification').click()
    cy.get('button.ant-btn-primary')
       .find('span[role="img"][aria-label="close"]')
       .click({ force: true })
    cy.contains('button.ant-btn-primary.ant-btn-dangerous', 'Clear').click({ force: true })
    
  })
})