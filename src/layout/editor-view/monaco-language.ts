export const languageMap = {
  abap: ['.abap'],
  apex: ['.cls'],
  azcli: ['.azcli'],
  bat: ['.bat', '.cmd'],
  c: ['.c', '.h'],
  cameligo: ['.mligo'],
  clojure: ['.clj', '.cljs', '.cljc', '.edn'],
  coffeescript: ['.coffee'],
  cpp: ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
  csharp: ['.cs', '.csx', '.cake'],
  css: ['.css'],
  dart: ['.dart'],
  dockerfile: ['.dockerfile'],
  ecl: ['.ecl'],
  fsharp: ['.fs', '.fsi', '.ml', '.mli', '.fsx', '.fsscript'],
  go: ['.go'],
  graphql: ['.graphql', '.gql'],
  handlebars: ['.handlebars', '.hbs'],
  hcl: ['.tf', '.tfvars', '.hcl'],
  html: ['.vue', '.html', '.htm', '.shtml', '.xhtml', '.mdoc', '.jsp', '.asp', '.aspx', '.jshtm'],
  ini: ['.ini', '.properties', '.gitconfig'],
  java: ['.java', '.jav'],
  javascript: ['.js', '.es6', '.jsx', '.mjs'],
  julia: ['.jl'],
  kotlin: ['.kt'],
  less: ['.less'],
  lexon: ['.lex'],
  lua: ['.lua'],
  m3: ['.m3', '.i3', '.mg', '.ig'],
  markdown: ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext'],
  mips: ['.s'],
  msdax: ['.dax', '.msdax'],
  'objective-c': ['.m'],
  pascal: ['.pas', '.p', '.pp'],
  pascaligo: ['.ligo'],
  perl: ['.pl'],
  php: ['.php', '.php4', '.php5', '.phtml', '.ctp'],
  postiats: ['.dats', '.sats', '.hats'],
  powerquery: ['.pq', '.pqm'],
  powershell: ['.ps1', '.psm1', '.psd1'],
  pug: ['.jade', '.pug'],
  python: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'],
  r: ['.r', '.rhistory', '.rmd', '.rprofile', '.rt'],
  razor: ['.cshtml'],
  redis: ['.redis'],
  restructuredtext: ['.rst'],
  ruby: ['.rb', '.rbx', '.rjs', '.gemspec', '.pp'],
  rust: ['.rs', '.rlib'],
  sb: ['.sb'],
  scala: ['.scala', '.sc', '.sbt'],
  scheme: ['.scm', '.ss', '.sch', '.rkt'],
  scss: ['.scss'],
  shell: ['.sh', '.bash'],
  sophia: ['.aes'],
  sol: ['.sol'],
  sql: ['.sql'],
  st: ['.st', '.iecst', '.iecplc', '.lc3lib'],
  swift: ['.swift'],
  systemverilog: ['.sv', '.svh'],
  tcl: ['.tcl'],
  twig: ['.twig'],
  typescript: ['.ts', '.tsx'],
  vb: ['.vb'],
  verilog: ['.v', '.vh'],
  xml: ['.xml', '.dtd', '.ascx', '.csproj', '.config', '.wxi', '.wxl', '.wxs', '.xaml', '.svg', '.svgz', '.opf', '.xsl'],
  yaml: ['.yaml', '.yml'],
  txt: ['.txt'],
  json: ['.json'],
};

export function findLanguage(suffix: string): string {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(languageMap)) {
    if (value.includes(suffix)) {
      return key;
    }
  }

  return '';
}
