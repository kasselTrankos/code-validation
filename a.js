const cheerio = require('cheerio')
const IO = require('./fp/monad/io')
// const S = require('sanctuary')
const {create, env} = require ('sanctuary')
const Z = require ('sanctuary-type-classes')
const R = require('ramda')
const $ = require ('sanctuary-def')
const code  = '<h2 class="title">Hello world</h2><h3>hola a todos</h3>' 
const ioTypeIdent = 'fp-units/io';
const IOType = $.NullaryType
  ('IO')
  ('http://example.com/my-package#Maybe')
  ([])
  (x => x != null)

const S = create ({checkTypes: true, env: env.concat([ IOType ])})
// $('h2.title').text('Hello there!')
// $('h2').addClass('welcome')

const cheerioIO = body => S.of(IO)(cheerio.load(body))
// const _ = cheerioIO(code)
const h2 = $ => $('h2').html()
const h3 = $ => $('h3').html()



// const b =IO.of(x => x +1)
const M = S.traverse(Array) (x=> x.split(' ')) (S.of(IO)('hola a to do'))
const K = S.traverse (S.of(IO)) (x =>  S.of(IO)(x + 2)) ([1, 90, 91, 102])
const J = S.traverse (Array) (x => [ h2(x), h3(x) ]) (cheerioIO(code))
 
// v['fantasy-land/ap'](u['fantasy-land/ap'](a['fantasy-land/map'](f => g => x => f(g(x))))) 
// is equivalent to 
// v['fantasy-land/ap'](u)['fantasy-land/ap'](a) (composition)


// const v = S.of(IO)(6)
// const u = S.of(IO)(x => x + 122);
// const a = S.of(IO)(x => x +1)
// console.log(v.ap(u.ap(a.map(f => g => x => f(g(x))))).unsafePerformIO(), 'made a valir AP')
// console.log(v.ap(u).ap(a).unsafePerformIO(), ' made a valid ap')
console.log(M.map(x => x.unsafePerformIO()))
console.log(K.unsafePerformIO())
console.log(J)