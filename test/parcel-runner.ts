import 'mocha';
import chai from 'chai';

mocha.ui('tdd');
mocha.setup('bdd');
mocha.run();

import './unit-new/Shape-test';
