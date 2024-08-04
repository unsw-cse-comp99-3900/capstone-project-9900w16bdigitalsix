describe("Student Path Test", () => {
  it("successfully loads", () => {
    cy.viewport(1600, 800);

    //login
    cy.visit("http://localhost:3333/login");
    cy.get("input#email").type("student2@unsw.edu");
    cy.get("input#password").type("admin123");
    cy.get("button#buttonLogin").click();

    cy.wait(1000);
    cy.scrollTo("top");

    // to create a team
    cy.contains("a", "Team").invoke("removeAttr", "target").click();
    cy.wait(2000);

    cy.contains("button", "Create a team").click();
    cy.url().should("include", "/team/student");
    cy.wait(2000);

    // edit team profile
    cy.contains("button", "Edit").click();
    cy.wait(2000);

    cy.get("#outlined-required").clear().type("Student_test");
    cy.wait(1000);

    cy.get("#demo-multiple-checkbox").click();
    cy.get('li[data-value="Python"]').click();
    cy.wait(500);
    cy.get('li[data-value="Java"]').click();
    cy.get("body").click(0, 0);
    cy.wait(500);

    // save the edit
    cy.contains("button", "Save").click();
    cy.wait(1000);
    cy.contains("h5", "Team Name: Student_test").should("exist");
    cy.contains("h5", "Python, Java").should("exist");
    cy.wait(1000);

    // invite others to join the team
    cy.contains("button", "invite new member").click();
    cy.wait(500);
    cy.get(".ant-checkbox-input").click();
    cy.contains("button", "OK").click();
    cy.contains("span", "student3 (student3@unsw.edu)").should("exist");
    cy.wait(500);

    // manage preference list
    cy.contains("a.nav-link", "My Project").click({ force: true });
    cy.url().should("include", "/project/myproject");
    cy.wait(1000);
    cy.contains("button", "Manage your preference list").click();
    cy.url().should("include", "/project/preference");
    cy.wait(1000);

    cy.get(".MuiSelect-select").should("have.length", 1);
    cy.get('textarea[placeholder="Reason"]').should("have.length", 1);
    cy.wait(500);
    // select projects
    cy.get(".MuiSelect-select").click();
    cy.contains("li", "P3 Project 3").eq(0).click();
    cy.wait(500);
    cy.get(".ant-input.css-dev-only-do-not-override-1uq9j6g.ant-input-outlined")
      .eq(0)
      .type("This is a student test reason.");
    cy.wait(500);

    // Add more projects
    cy.contains("button", "Add one").click();
    cy.wait(500);
    cy.get(".MuiSelect-select").should("have.length", 2);
    cy.get('textarea[placeholder="Reason"]').should("have.length", 2);
    cy.wait(500);
    cy.get(".MuiSelect-select").eq(1).click();
    cy.contains("li", "P4 Project 4").click();
    cy.wait(500);
    cy.get(".ant-input.css-dev-only-do-not-override-1uq9j6g.ant-input-outlined")
      .eq(1)
      .type("This is a student test reason.");
    cy.wait(500);

    cy.contains("button", "Add one").click();
    cy.wait(500);
    cy.get(".MuiSelect-select").should("have.length", 3);
    cy.get('textarea[placeholder="Reason"]').should("have.length", 3);
    cy.wait(500);
    cy.get(".MuiSelect-select").eq(2).click();
    cy.contains("li", "P5 Project 5").click();
    cy.wait(500);
    cy.get(".ant-input.css-dev-only-do-not-override-1uq9j6g.ant-input-outlined")
      .eq(2)
      .type("This is a student test reason.");
    cy.wait(500);

    cy.get('button[aria-label="delete"]').eq(1).click();
    cy.wait(500);
    cy.get(".MuiSelect-select").should("have.length", 2);
    cy.get('textarea[placeholder="Reason"]').should("have.length", 2);
    cy.wait(500);

    // submit the preference list
    cy.get("button.MuiButtonBase-root.MuiButton-root").eq(2).click();
    cy.wait(1000);

    cy.get("button.MuiButtonBase-root.MuiButton-root").eq(0).click();
    cy.wait(1000);
    cy.url().should("include", "/project/myproject");
    cy.wait(500);

    // logout
    cy.contains("a", "Logout").invoke("removeAttr", "target").click();
    cy.url().should("include", "/login");
  });
});
