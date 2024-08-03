describe('Client Path Test', () => {
  it('successfully loads', () => {
    cy.viewport(1280, 720);
    //login
    // in sumbitted file should be admin123
    cy.visit('http://localhost:3000/login')
    cy.get('input#email').type('z5462028@ad.unsw.edu.au')
    cy.get('input#password').type('admin123')
    cy.get('button#buttonLogin').click()

    cy.url().should('include', '/project/allproject');
    // cy.get('button.navbar-toggler').click(); 
    
    
    cy.contains('a.nav-link', 'Role').click({force: true});
    cy.wait(2000)
    cy.url().should('include', '/admin/role-manage');

    cy.get('input[placeholder="Search User"]').type('lisa1');
    cy.contains('.list-item-meta-name', 'Lisa1').should('be.visible');

    cy.contains('.list-item', 'Lisa1').within(() => {
      cy.get('button.list-item-button').click();
    });
    cy.get('div.modal-body').find('div.ant-select').click(); // 打开下拉菜单

    cy.get('div.ant-select-selector').should('contain', 'Coordinator');

    cy.contains('button', 'Save').click();

    cy.contains('a.nav-link', 'My Project').click({force: true})
    cy.url().should('include', '/project/admin'); 

    cy.get('input[placeholder="Search Project"]').type('Updat');
    cy.get('button').contains('Filter').click();
    cy.contains('.list-item-meta-name', 'Updated Project Title').should('be.visible');
    cy.contains('.list-item', 'Updated Project Title').within(() => {
      cy.get('button.list-item-button').click();
    });
    cy.url().should('include', '/project/admin/');
    cy.contains('h5', 'Updated Project Title').should('be.visible');
    cy.get('button').contains('Assign Tutor').click();
    cy.get('.ant-list-item').contains('Assign').click();
    cy.get('button').contains('Assign Coordinator').click();
    cy.get('.ant-list-item').contains('Assign').click();
    cy.contains('a.nav-link', 'My Project').click({force: true})
    cy.url().should('include', '/project/admin'); 
    cy.get('button').contains('REPORT').click();
    cy.wait(1000); 
    // cy.get('button').contains('Assign').click({ force: true });

    cy.get('body').find('*').last().scrollIntoView({ duration: 2000 });




   

  })
})