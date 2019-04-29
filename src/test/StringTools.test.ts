//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';
import { StringTools } from '../StringTools';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Stringtools Tests", function () {

    // Defines a Mocha unit test
    test("Test splitter", function () {
        // assert.equal(-1, [1, 2, 3].indexOf(5));
        let res = StringTools.splitCunks("aaa.bbb.cccc");
        assert.equal(3, res.length);
    });
    test("Test CheckChunks", function () {
        let res = StringTools.checkChunks(["aaa", "bbb", "ccc"], ["aaa", "bbb", "ccc", "ddd"]);
        assert.equal("ddd", res);
    });

    test("Test GetVar", function () {
        let res = StringTools.getVar("asdf asdfqewrrewt sfgsdfgsdfg.g.ty.y.u.dasfasdf.");
        assert.equal("sfgsdfgsdfg.g.ty.y.u.dasfasdf.", res);
        let res1 = StringTools.getVar("asdf asdfqewrrewt sfgsdfgsdfg.g.ty.y.u.dasfasdf");
        assert.equal(undefined, res1);
        let res2 = StringTools.getVar(" res.sfx.");
        res2 = StringTools.getVar(" res.sfx.");
        assert.equal("res.sfx.", res2);
    });
});