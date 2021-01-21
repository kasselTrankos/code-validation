// c
const mongo = require('./fp/monad/mongo')
import { fork, chain, encase, map, encaseP, resolve, parallel, filter } from 'fluture'
import { pipe, flatten } from 'ramda'

const { log } = require('./utils')
import cheerio from 'cheerio'
import sanctuary from 'sanctuary'
import fetch from 'node-fetch'


const S = sanctuary
const { find, insert } = mongo 
const { load } = cheerio
const seed = 'https://miqueridowatson.com/'
const deepper = 2
const dbName = 'crawl'
const tbl = 'links'

const validLink = ({hostname}) => x => isFullPath(hostname)(x) ||  isAbsolutePath(x)
const isAbsolutePath = x => x.substring(0,1) === '/'
const isFullPath = hostname => x => x.includes(hostname)


// href :: Cheerio -> HTML  
const href = $ => $('a')

// toArray :: Cheerio -> []
const toArray = $ => $.toArray()

// attr :: String -> Cheerio -> String
const attr = att => $ => $.attr(att)

// unique ::  [ * ] -> [ * ]
const unique = x => [ ... new Set(x) ]

const form = ({origin}) => x => isFullPath(origin)(x) ? x :  S.concat (origin) (x)

const prop = k => o => o[k]

// getLinks :: String -> [ String ]
const getLinks = seed => dom => pipe(
    load,
    href,
    S.compose (S.map(cheerio)) (toArray),
    S.map(attr('href')),
    S.filter(validLink (seed) ),
    unique,
    S.map( form(seed) )
) (dom)




const get = seed => encaseP(fetch)(seed)
  .pipe(chain ( encaseP(r => r.text() ) ))
  .pipe( map ( getLinks (new URL(seed) ) ))

 
const deep = x => find (dbName) (tbl) ( { url: x} )
    .pipe(
        chain( r => r.length 
            ? resolve( prop('links') (prop (0) (r) ) )
            : get(x)
                .pipe(chain(
                    v => insert(dbName) (tbl) ({url: x, links: v})
                    .pipe(chain(()=> resolve(v)))
                ))
    ) )

const proc = 
// find(dbName) (tbl) ({})
 get(seed)
  .pipe(chain(r => parallel(Infinity) (r.map(deep)) ))
  .pipe(map(pipe(flatten, unique)))
  .pipe(chain(r => parallel(Infinity) (r.map(deep)) ))
  
fork(log('ERROR')) (log('SUCCESS')) (proc)
