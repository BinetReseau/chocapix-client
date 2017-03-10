var UserCreation = require('./account.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var UserList = require('../../user/list.user.po.js');

describe('UserCreation', function() {
    var uC = new UserCreation();
    var uL = new UserList();
    var barsBarPage = new BarsBarPage();

    it('should create a new user without errors', function() {
        uC.go();

        expect(uC.isErrorMessagePresent()).toBe(false);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setLastName("Germain");
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setFirstName("Jean-Claude");
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);
        expect(uC.getEmailClass()).toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setEmail("jean-claude.germain@polytechnique.edu");
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);
        expect(uC.getEmailClass()).not.toMatch(/has-error/);

        uC.setPseudo("JC");
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setLogin("admin");
        expect(uC.getLoginClass()).toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setLogin("grm");
        expect(uC.getLoginClass()).not.toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setPassword("grm");
        expect(uC.getPasswordClass()).toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setPasswordBis("caca");
        expect(uC.getPasswordClass()).toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).toMatch(/disabled/);

        uC.setPasswordBis("grm");
        expect(uC.getPasswordClass()).not.toMatch(/has-error/);
        expect(uC.getCreateBTNClass()).not.toMatch(/disabled/);

        uC.setCreateSolde(0);
        expect(uC.getCreateBTNClass()).not.toMatch(/disabled/);

        uC.setCreateSolde(45);
        expect(uC.getCreateBTNClass()).not.toMatch(/disabled/);

        uC.validateCreation();
        expect(uC.isErrorMessagePresent()).toBe(false);

        // go check if the new user is created
        uL.go();
        var user = uL.getRowText(0);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

    });

    it('should create some accounts in Natation Jône', function() {
        barsBarPage.changeToBar('Natation Jône');
        uC.go();

        uC.setLastName("Dumas");
        uC.setFirstName("Grégoire");
        uC.setEmail("gregoire.dumas@polytechnique.edu");
        uC.setPseudo("La Dum");
        uC.setLogin("gms");
        uC.setPassword("gms");
        uC.setPasswordBis("gms");
        uC.setCreateSolde(70);

        uC.validateCreation();

        uC.go();

        uC.setLastName("Lenormand");
        uC.setFirstName("Augustin");
        uC.setEmail("augustin.lenormand@polytechnique.edu");
        uC.setPseudo("Toutatis");
        uC.setLogin("gus");
        uC.setPassword("gus");
        uC.setPasswordBis("gus");
        uC.setCreateSolde(50);

        uC.validateCreation();

        uC.go();

        expect(uC.getImportBTNClass()).toMatch(/disabled/);
        uC.setImportUsername('claude');
        expect(uC.getImportBTNClass()).not.toMatch(/disabled/);
        uC.setImportSolde('25');

        uC.validateImportation();
        expect(uC.isErrorMessagePresent()).toBe(false);

        uL.go();

        var user = uL.getRowText(1);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/25,00 €/);
    });

    it('should import some account from Natation Jône to Aviron Jône', function() {
        barsBarPage.changeToBar('Aviron Jône');

        uC.go();

        uC.setImportUsername('dumas');
        uC.setImportSolde('2500');
        uC.validateImportation();

        uC.go();

        uC.setImportUsername('aug');
        uC.setImportSolde('40');
        uC.validateImportation();

        uL.go();

        user = uL.getRowText(0);
        expect(user).toMatch(/Dumas Grégoire/);
        expect(user).toMatch(/La Dum/);
        expect(user).toMatch(/2 500,00 €/);

        user = uL.getRowText(1);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

        user = uL.getRowText(2);
        expect(user).toMatch(/Lenormand Augustin/);
        expect(user).toMatch(/Toutatis/);
        expect(user).toMatch(/40,00 €/);

    });
});
