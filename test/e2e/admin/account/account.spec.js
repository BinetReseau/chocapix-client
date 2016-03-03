var UserCreation = require('./account.po.js');
var BarsBarPage = require('../../bar/bar.po.js');
var UserList = require('../../user/list.user.po.js');

describe('UserCreation', function() {
    var UC = new UserCreation();
    var UL = new UserList();
    var barsBarPage = new BarsBarPage();

    it('should create a new user without errors', function() {
        UC.go();

        expect(UC.isErrorMessagePresent()).toBe(false);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setLastName("Germain");
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setFirstName("Jean-Claude");
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);
        expect(UC.getEmailClass()).toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setEmail("jean-claude.germain@polytechnique.edu");
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);
        expect(UC.getEmailClass()).not.toMatch(/has-error/);

        UC.setPseudo("JC");
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setLogin("admin");
        expect(UC.getLoginClass()).toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setLogin("grm");
        expect(UC.getLoginClass()).not.toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setPassword("grm");
        expect(UC.getPasswordClass()).toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setPasswordBis("caca");
        expect(UC.getPasswordClass()).toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).toMatch(/disabled/);

        UC.setPasswordBis("grm");
        expect(UC.getPasswordClass()).not.toMatch(/has-error/);
        expect(UC.getCreateBTNClass()).not.toMatch(/disabled/);

        UC.setCreateSolde(0);
        expect(UC.getCreateBTNClass()).not.toMatch(/disabled/);

        UC.setCreateSolde(45);
        expect(UC.getCreateBTNClass()).not.toMatch(/disabled/);

        UC.validateCreation();
        expect(UC.isErrorMessagePresent()).toBe(false);

        // go check if the new user is created
        UL.go();
        var user = UL.getRowText(0);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

    });

    it('should create some accounts in Natation Jône', function() {
        barsBarPage.changeToBar('Natation Jône');
        UC.go();

        UC.setLastName("Dumas");
        UC.setFirstName("Grégoire");
        UC.setEmail("gregoire.dumas@polytechnique.edu");
        UC.setPseudo("La Dum");
        UC.setLogin("gms");
        UC.setPassword("gms");
        UC.setPasswordBis("gms");
        UC.setCreateSolde(70);

        UC.validateCreation();

        UC.go();

        UC.setLastName("Lenormand");
        UC.setFirstName("Augustin");
        UC.setEmail("augustin.lenormand@polytechnique.edu");
        UC.setPseudo("Toutatis");
        UC.setLogin("gus");
        UC.setPassword("gus");
        UC.setPasswordBis("gus");
        UC.setCreateSolde(50);

        UC.validateCreation();

        UC.go();

        expect(UC.getImportBTNClass()).toMatch(/disabled/);
        UC.setImportUsername('claude');
        expect(UC.getImportBTNClass()).not.toMatch(/disabled/);
        UC.setImportSolde('25');

        UC.validateImportation();
        expect(UC.isErrorMessagePresent()).toBe(false);

        UL.go();

        var user = UL.getRowText(1);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/25,00 €/);
    });

    it('should import some account from Natation Jône to Aviron Jône', function() {
        barsBarPage.changeToBar('Aviron Jône');

        UC.go();

        UC.setImportUsername('dumas');
        UC.setImportSolde('2500');
        UC.validateImportation();

        UC.go();

        UC.setImportUsername('aug');
        UC.setImportSolde('40');
        UC.validateImportation();

        UL.go();

        user = UL.getRowText(0);
        expect(user).toMatch(/Dumas Grégoire/);
        expect(user).toMatch(/La Dum/);
        expect(user).toMatch(/2 500,00 €/);

        user = UL.getRowText(1);
        expect(user).toMatch(/Germain Jean-Claude/);
        expect(user).toMatch(/JC/);
        expect(user).toMatch(/45,00 €/);

        user = UL.getRowText(2);
        expect(user).toMatch(/Lenormand Augustin/);
        expect(user).toMatch(/Toutatis/);
        expect(user).toMatch(/40,00 €/);

    });
});
