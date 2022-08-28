import languages from './languages';

export interface ILanguage {
  ids: string | string[];
  defaultExtension: string;
}

type SupperType = {
  icon: string,
  extensions: string[],
  languages?: ILanguage[],
  filenamesGlob?: string[],
  extensionsGlob?: string[],
  filename?: boolean,
};

const extensions: {
  default: {
    file: {
      icon: string
    }
  },
  supported: SupperType[]
} = {
  default: {
    file: { icon: 'file' },
  },
  supported: [
    {
      icon: 'access',
      extensions: [
        'accdb',
        'accdt',
        'mdb',
        'accda',
        'accdc',
        'accde',
        'accdp',
        'accdr',
        'accdu',
        'ade',
        'adp',
        'laccdb',
        'ldb',
        'mam',
        'maq',
        'mdw',
      ],

    },
    {
      icon: 'access2',
      extensions: [
        'accdb',
        'accdt',
        'mdb',
        'accda',
        'accdc',
        'accde',
        'accdp',
        'accdr',
        'accdu',
        'ade',
        'adp',
        'laccdb',
        'ldb',
        'mam',
        'maq',
        'mdw',
      ],

    },
    {
      icon: 'actionscript',
      extensions: [],
      languages: [languages.actionscript],

    },
    {
      icon: 'actionscript2',
      extensions: [],

      languages: [languages.actionscript],

    },
    {
      icon: 'ada',
      extensions: [],
      languages: [languages.ada],

    },
    {
      icon: 'advpl',
      extensions: [],
      languages: [languages.advpl],

    },
    { icon: 'ai', extensions: ['ai'] },
    {
      icon: 'ai2', extensions: ['ai'],
    },
    {
      icon: 'al',
      extensions: [],
      languages: [languages.al],

    },
    {
      icon: 'allcontributors',
      extensions: ['.all-contributorsrc'],
      filename: true,

    },
    {
      icon: 'affinitydesigner',
      extensions: ['afdesign', 'affinitydesigner'],

    },
    {
      icon: 'affinityphoto',
      extensions: ['afphoto', 'affinityphoto'],

    },
    {
      icon: 'affinitypublisher',
      extensions: ['afpub', 'affinitypublisher'],

    },
    {
      icon: 'appscript',
      extensions: ['gs'],

    },
    {
      icon: 'fitbit',
      extensions: ['fba'],

    },
    {
      icon: 'angular',
      extensions: [
        '.angular-cli.json',
        'angular-cli.json',
        'angular.json',
        '.angular.json',
      ],
      filename: true,

    },
    {
      icon: 'ng_component_dart',
      extensions: ['component.dart'],

    },
    {
      icon: 'ng_component_ts',
      extensions: ['component.ts'],

    },
    {
      icon: 'ng_component_js',
      extensions: ['component.js'],

    },
    {
      icon: 'ng_controller_ts',
      extensions: ['controller.ts'],

    },
    {
      icon: 'ng_controller_js',
      extensions: ['controller.js'],

    },
    {
      icon: 'ng_directive_dart',
      extensions: ['directive.dart'],

    },
    {
      icon: 'ng_directive_ts',
      extensions: ['directive.ts'],

    },
    {
      icon: 'ng_directive_js',
      extensions: ['directive.js'],

    },
    {
      icon: 'ng_guard_dart',
      extensions: ['guard.dart'],

    },
    {
      icon: 'ng_guard_ts',
      extensions: ['guard.ts'],

    },
    {
      icon: 'ng_guard_js',
      extensions: ['guard.js'],

    },
    {
      icon: 'ng_module_dart',
      extensions: ['module.dart'],

    },
    {
      icon: 'ng_module_ts',
      extensions: ['module.ts'],

    },
    {
      icon: 'ng_module_js',
      extensions: ['module.js'],

    },
    {
      icon: 'ng_pipe_dart',
      extensions: ['pipe.dart'],

    },
    {
      icon: 'ng_pipe_ts',
      extensions: ['pipe.ts'],

    },
    {
      icon: 'ng_pipe_js',
      extensions: ['pipe.js'],

    },
    {
      icon: 'ng_routing_dart',
      extensions: ['routing.dart'],

    },
    {
      icon: 'ng_routing_ts',
      extensions: ['routing.ts'],

    },
    {
      icon: 'ng_routing_js',
      extensions: ['routing.js'],

    },
    {
      icon: 'ng_routing_dart',
      extensions: ['app-routing.module.dart'],
      filename: true,

    },
    {
      icon: 'ng_routing_ts',
      extensions: ['app-routing.module.ts'],
      filename: true,

    },
    {
      icon: 'ng_routing_js',
      extensions: ['app-routing.module.js'],
      filename: true,

    },
    {
      icon: 'ng_smart_component_dart',
      extensions: ['page.dart', 'container.dart'],

    },
    {
      icon: 'ng_smart_component_ts',
      extensions: ['page.ts', 'container.ts'],

    },
    {
      icon: 'ng_smart_component_js',
      extensions: ['page.js', 'container.js'],

    },
    {
      icon: 'ng_service_dart',
      extensions: ['service.dart'],

    },
    {
      icon: 'ng_service_ts',
      extensions: ['service.ts'],

    },
    {
      icon: 'ng_service_js',
      extensions: ['service.js'],

    },
    {
      icon: 'ng_interceptor_dart',
      extensions: ['interceptor.dart'],

    },
    {
      icon: 'ng_interceptor_ts',
      extensions: ['interceptor.ts'],

    },
    {
      icon: 'ng_interceptor_js',
      extensions: ['interceptor.js'],

    },
    {
      icon: 'ng_component_ts2',
      extensions: ['component.ts'],

    },
    {
      icon: 'ng_component_js2',
      extensions: ['component.js'],

    },
    {
      icon: 'ng_directive_ts2',
      extensions: ['directive.ts'],

    },
    {
      icon: 'ng_directive_js2',
      extensions: ['directive.js'],

    },
    {
      icon: 'ng_module_ts2',
      extensions: ['module.ts'],

    },
    {
      icon: 'ng_module_js2',
      extensions: ['module.js'],

    },
    {
      icon: 'ng_pipe_ts2',
      extensions: ['pipe.ts'],

    },
    {
      icon: 'ng_pipe_js2',
      extensions: ['pipe.js'],

    },
    {
      icon: 'ng_routing_ts2',
      extensions: ['routing.ts'],

    },
    {
      icon: 'ng_routing_js2',
      extensions: ['routing.js'],

    },
    {
      icon: 'ng_routing_ts2',
      extensions: ['app-routing.module.ts'],
      filename: true,

    },
    {
      icon: 'ng_routing_js2',
      extensions: ['app-routing.module.js'],
      filename: true,

    },
    {
      icon: 'ng_smart_component_ts2',
      extensions: ['page.ts', 'container.ts'],

    },
    {
      icon: 'ng_smart_component_js2',
      extensions: ['page.js', 'container.js'],

    },
    {
      icon: 'ng_service_ts2',
      extensions: ['service.ts'],

    },
    {
      icon: 'ng_service_js2',
      extensions: ['service.js'],

    },
    {
      icon: 'ng_tailwind',
      extensions: ['ng-tailwind.js'],
      filename: true,

    },
    {
      icon: 'affectscript',
      extensions: [],
      languages: [languages.affectscript],

    },
    {
      icon: 'ansible',
      extensions: [],
      languages: [languages.ansible],

    },
    {
      icon: 'antlr',
      extensions: [],
      languages: [languages.antlr],

    },
    {
      icon: 'anyscript',
      extensions: [],
      languages: [languages.anyscript],

    },
    {
      icon: 'apache',
      extensions: [],
      languages: [languages.apache],

    },
    {
      icon: 'apex',
      extensions: [],
      languages: [languages.apex],

    },
    {
      icon: 'apib',
      extensions: [],
      languages: [languages.apib],

    },
    {
      icon: 'api_extractor',
      extensions: ['api-extractor.json', 'api-extractor-base.json'],
      filename: true,

    },
    {
      icon: 'apl',
      extensions: [],
      languages: [languages.apl],

    },
    {
      icon: 'applescript',
      extensions: [],
      languages: [languages.applescript],

    },
    {
      icon: 'appsemble',
      extensions: ['.appsemblerc.yaml', 'app-definition.yaml'],
      filename: true,

    },
    {
      icon: 'appveyor',
      extensions: ['appveyor.yml', '.appveyor.yml'],
      filename: true,

    },
    { icon: 'arduino', extensions: ['ino', 'pde'] },
    {
      icon: 'asciidoc',
      extensions: [],
      languages: [languages.asciidoc],

    },
    {
      icon: 'asp',
      extensions: [],
      languages: [languages.asp],

    },
    { icon: 'aspx', extensions: ['aspx', 'ascx'] },
    {
      icon: 'assembly',
      extensions: [],
      languages: [languages.assembly],

    },
    {
      icon: 'astro',
      extensions: ['astro'],

    },
    {
      icon: 'astroconfig',
      filename: true,
      filenamesGlob: ['astro.config'],
      extensions: [],
      extensionsGlob: ['js', 'cjs', 'mjs', 'ts'],

    },
    {
      icon: 'ats',
      extensions: [],
      languages: [languages.ats],

    },
    {
      // https://en.wikipedia.org/wiki/Audio_file_format
      icon: 'audio',
      extensions: [
        'aac',
        'act',
        'aiff',
        'amr',
        'ape',
        'au',
        'dct',
        'dss',
        'dvf',
        'flac',
        'gsm',
        'iklax',
        'ivs',
        'm4a',
        'm4b',
        'm4p',
        'mmf',
        'mogg',
        'mp3',
        'mpc',
        'msv',
        'oga',
        'ogg',
        'opus',
        'ra',
        'raw',
        'tta',
        'vox',
        'wav',
        'wma',
      ],

    },
    {
      icon: 'aurelia',
      extensions: ['aurelia.json'],
      filename: true,

    },
    {
      icon: 'autohotkey',
      extensions: [],
      languages: [languages.autohotkey],

    },
    {
      icon: 'autoit',
      extensions: [],
      languages: [languages.autoit],

    },
    {
      icon: 'avif',
      extensions: ['avif'],

    },
    {
      icon: 'avro',
      extensions: [],
      languages: [languages.avro],

    },
    {
      icon: 'awk',
      extensions: ['awk'],

    },
    { icon: 'aws', extensions: [] },
    {
      icon: 'azure',
      extensions: [],
      languages: [languages.azcli],

    },
    {
      icon: 'azurepipelines',
      extensions: ['azure-pipelines.yml', '.vsts-ci.yml'],
      filename: true,
      languages: [languages.azurepipelines],

    },
    {
      icon: 'babel',
      extensions: ['.babelrc', '.babelignore'],
      filenamesGlob: ['.babelrc', 'babel.config'],
      extensionsGlob: ['js', 'cjs', 'mjs', 'json'],

      filename: true,

    },
    {
      icon: 'babel2',
      extensions: ['.babelrc', '.babelignore'],
      filenamesGlob: ['.babelrc', 'babel.config'],
      extensionsGlob: ['js', 'cjs', 'mjs', 'json'],

      filename: true,

    },
    {
      icon: 'ballerina',
      extensions: [],
      languages: [languages.ballerina],

    },
    {
      icon: 'bat',
      extensions: [],
      languages: [languages.bat],

    },
    {
      icon: 'bats',
      extensions: [],
      languages: [languages.bats],

    },
    {
      icon: 'bazaar',
      extensions: ['.bzrignore'],
      filename: true,

    },
    {
      icon: 'bazel',
      extensions: ['BUILD.bazel', '.bazelrc', 'bazel.rc', 'bazel.bazelrc'],
      filename: true,
      languages: [languages.bazel, languages.starlark],

    },
    {
      icon: 'befunge',
      extensions: [],
      languages: [languages.befunge],

    },
    {
      icon: 'bicep',
      extensions: [],
      languages: [languages.bicep],

    },
    {
      icon: 'biml',
      extensions: [],
      languages: [languages.biml],

    },
    {
      // http://www.file-extensions.org/filetype/extension/name/binary-files
      icon: 'binary',
      extensions: [
        'a',
        'app',
        'bin',
        'cmo',
        'cmx',
        'cma',
        'cmxa',
        'cmi',
        'dll',
        'exe',
        'hl',
        'ilk',
        'lib',
        'n',
        'ndll',
        'o',
        'obj',
        'pyc',
        'pyd',
        'pyo',
        'pdb',
        'scpt',
        'scptd',
        'so',
      ],

    },
    {
      icon: 'bithound',
      extensions: ['.bithoundrc'],
      filename: true,

    },
    {
      icon: 'bitbucketpipeline',
      extensions: ['bitbucket-pipelines.yml'],
      filename: true,

    },
    {
      icon: 'blade',
      extensions: [],
      languages: [languages.blade],

    },
    {
      icon: 'blitzbasic',
      extensions: ['bb'],
      languages: [languages.blitzbasic],

    },
    {
      icon: 'bolt',
      extensions: [],
      languages: [languages.bolt],

    },
    {
      icon: 'bosque',
      extensions: [],
      languages: [languages.bosque],

    },
    {
      icon: 'bower',
      extensions: ['.bowerrc', 'bower.json'],
      filename: true,

    },
    {
      icon: 'browserslist',
      extensions: ['.browserslistrc', 'browserslist'],
      filename: true,

    },
    {
      icon: 'buckbuild',
      extensions: ['.buckconfig'],
      filename: true,

    },
    {
      icon: 'bun',
      extensions: ['bun', 'lockb'],

    },
    {
      icon: 'bundler',
      extensions: ['gemfile', 'gemfile.lock'],

    },
    {
      icon: 'bundler',
      extensions: ['gemfile', 'gemfile.lock'],
      filename: true,

    },
    {
      icon: 'bunfig',
      extensions: ['bunfig.toml'],
      filename: true,

    },
    {
      icon: 'c',
      extensions: [],
      languages: [languages.c],

    },
    {
      icon: 'c2',
      extensions: [],
      languages: [languages.c],

    },
    {
      icon: 'c3',
      extensions: [],
      languages: [languages.c],

    },
    {
      icon: 'c_al',
      extensions: [],
      languages: [languages.c_al],

    },
    {
      icon: 'cabal',
      extensions: [],
      languages: [languages.cabal],

    },
    {
      icon: 'caddy',
      extensions: [],
      languages: [languages.caddyfile],

    },
    { icon: 'cake', extensions: ['cake'] },
    { icon: 'cakephp', extensions: [] },
    {
      icon: 'capacitor',
      extensions: [],
      extensionsGlob: ['json'],
      filename: true,
      filenamesGlob: ['capacitor.config'],

    },
    {
      icon: 'cargo',
      extensions: ['cargo.toml', 'cargo.lock'],
      filename: true,

    },
    {
      icon: 'casc',
      extensions: [],
      languages: [languages.casc],

    },
    {
      icon: 'cddl',
      extensions: [],
      languages: [languages.cddl],

    },
    {
      icon: 'cert',
      extensions: [
        'csr',
        'crt',
        'cer',
        'der',
        'pfx',
        'p12',
        'p7b',
        'p7r',
        'src',
        'crl',
        'sst',
        'stl',
      ],

    },
    {
      icon: 'ceylon',
      extensions: [],
      languages: [languages.ceylon],

    },
    {
      icon: 'cf',
      extensions: ['lucee'],
      languages: [languages.coldfusion],

    },
    {
      icon: 'cf2',
      extensions: ['lucee'],
      languages: [languages.coldfusion],

    },
    {
      icon: 'cfc',
      extensions: [],
      languages: [languages.cfc],

    },
    {
      icon: 'cfc2',
      extensions: [],
      languages: [languages.cfc],

    },
    {
      icon: 'cfm',
      extensions: [],
      languages: [languages.cfm],

    },
    {
      icon: 'cfm2',
      extensions: [],
      languages: [languages.cfm],

    },
    {
      icon: 'cheader',
      extensions: ['h'],

    },
    {
      icon: 'chef',
      extensions: [
        'chefignore',
        'berksfile',
        'berksfile.lock',
        'policyfile.rb',
        'policyfile.lock.json',
      ],
      filename: true,

    },
    { icon: 'class', extensions: ['class'] },
    {
      icon: 'circleci',
      extensions: ['circle.yml'],

      filename: true,

    },
    {
      icon: 'clojure',
      extensions: ['cjm', 'cljc'],
      languages: [languages.clojure],

    },
    {
      icon: 'clojurescript',
      extensions: ['cljs'],
      languages: [languages.clojurescript],

    },
    {
      icon: 'cloudfoundry',
      extensions: ['.cfignore'],

      filename: true,
      languages: [languages.cloudfoundrymanifest],

    },
    {
      icon: 'cmake',
      extensions: [],
      languages: [languages.cmake, languages.cmakecache],

    },
    {
      icon: 'cobol',
      extensions: [],
      languages: [languages.cobol],

    },
    {
      icon: 'codeql',
      extensions: [],
      languages: [languages.codeql],

    },
    {
      icon: 'codeowners',
      extensions: ['codeowners'],
      filename: true,

    },
    {
      icon: 'codacy',
      extensions: ['.codacy.yml', '.codacy.yaml'],

      filename: true,

    },
    {
      icon: 'codeclimate',
      extensions: ['.codeclimate.yml'],

      filename: true,

    },
    {
      icon: 'codecov',
      extensions: ['codecov.yml', '.codecov.yml'],
      filename: true,

    },
    { icon: 'codekit', extensions: ['kit'] },
    {
      icon: 'codekit',
      extensions: [
        'config.codekit',
        'config.codekit2',
        'config.codekit3',
        '.config.codekit',
        '.config.codekit2',
        '.config.codekit3',
      ],
      filename: true,

    },
    {
      icon: 'coffeelint',
      extensions: ['coffeelint.json', '.coffeelintignore'],
      filename: true,

    },
    {
      icon: 'coffeescript',
      extensions: [],
      languages: [languages.coffeescript],

    },
    {
      icon: 'conan',
      extensions: ['conanfile.txt', 'conanfile.py'],
      filename: true,

    },
    {
      icon: 'conda',
      extensions: ['.condarc'],
      filename: true,

    },
    {
      icon: 'config',
      extensions: ['plist'],
      languages: [
        languages.properties,
        languages.dotenv,
        languages.springbootproperties,
      ],

    },
    {
      icon: 'config',
      extensions: ['.tool-versions'],

      filename: true,

    },
    {
      icon: 'commitizen',
      extensions: ['.czrc', '.cz.json'],
      filename: true,

    },
    {
      icon: 'commitlint',
      extensions: ['.commitlintrc'],
      filename: true,

    },
    {
      icon: 'commitlint',
      extensions: [
        'commitlint.config.js',
        'commitlint.config.cjs',
        'commitlint.config.ts',
      ],
      filenamesGlob: ['.commitlintrc'],
      extensionsGlob: ['json', 'yaml', 'yml', 'js', 'cjs', 'ts'],
      filename: true,

    },
    { icon: 'compass', extensions: [] },
    {
      icon: 'composer',
      extensions: ['composer.json', 'composer.lock'],
      filename: true,

    },
    {
      icon: 'chef_cookbook',
      extensions: [],
      languages: [languages.cookbook],

    },
    {
      icon: 'confluence',
      extensions: [],
      languages: [languages.confluence],

    },
    {
      icon: 'coveralls',
      extensions: ['.coveralls.yml'],
      filename: true,

    },
    {
      icon: 'cpp',
      extensions: [],
      languages: [languages.cpp],

    },
    {
      icon: 'cpp2',
      extensions: [],
      languages: [languages.cpp],

    },
    {
      icon: 'cpp3',
      extensions: [],
      languages: [languages.cpp],

    },
    {
      icon: 'cppheader',
      extensions: ['hpp', 'hh', 'hxx', 'h++'],

    },
    {
      icon: 'crowdin',
      extensions: ['crowdin.yml'],
      filename: true,

    },
    {
      icon: 'crystal',
      extensions: [],
      languages: [languages.crystal],

    },
    {
      icon: 'csharp',
      extensions: ['csx'],
      languages: [languages.csharp],

    },
    {
      icon: 'csharp2',
      extensions: ['csx'],
      languages: [languages.csharp],

    },
    {
      icon: 'cspell',
      extensions: [],
      filenamesGlob: ['cspell.config', 'cspell', '.cspell'],
      extensionsGlob: ['json', 'js', 'cjs', 'yaml', 'yml'],
      filename: true,

    },
    { icon: 'csproj', extensions: ['csproj'] },
    {
      icon: 'css',
      extensions: [],
      languages: [languages.css],

    },
    {
      icon: 'csscomb',
      extensions: ['.csscomb.json'],
      filename: true,

    },
    {
      icon: 'csslint',
      extensions: ['.csslintrc'],
      filename: true,

    },
    { icon: 'cssmap', extensions: ['css.map'] },
    {
      icon: 'cucumber',
      extensions: [],
      languages: [languages.cucumber],

    },
    {
      icon: 'cuda',
      extensions: [],
      languages: [languages.cuda],

    },
    {
      icon: 'cython',
      extensions: [],
      languages: [languages.cython],

    },
    {
      icon: 'cypress',
      extensions: [
        'cypress.json',
        'cypress.env.json',
        'cypress.config.js',
        'cypress.config.ts',
        'cypress.config.cjs',
        'cypress.config.mjs',
      ],
      filename: true,

    },
    {
      icon: 'cypress_spec',
      extensions: [
        'cy.js',
        'cy.mjs',
        'cy.cjs',
        'cy.coffee',
        'cy.ts',
        'cy.tsx',
        'cy.jsx',
      ],

    },
    {
      icon: 'cvs',
      extensions: ['.cvsignore'],
      filename: true,

    },
    {
      icon: 'dal',
      extensions: [],
      languages: [languages.dal],

    },
    {
      icon: 'darcs',
      extensions: ['.boringignore'],
      filename: true,

    },
    {
      icon: 'dartlang',
      extensions: [],
      languages: [languages.dart],

    },
    {
      icon: 'dartlang_generated',
      extensions: ['g.dart', 'freezed.dart'],
      languages: [],

    },
    {
      icon: 'dartlang_ignore',
      extensions: ['.pubignore'],
      filename: true,
      languages: [],

    },
    {
      icon: 'db', extensions: ['db'],
    },
    {
      icon: 'deno',
      extensions: [],
      filenamesGlob: ['deno'],
      extensionsGlob: ['json', 'jsonc'],
      filename: true,

    },
    {
      icon: 'dependabot',
      extensions: ['dependabot.yml', 'dependabot.yaml'],
      filename: true,

    },
    {
      icon: 'dependencies',
      extensions: ['dependencies.yml'],
      filename: true,

    },
    {
      icon: 'delphi',
      extensions: [],
      languages: [languages.pascal],

    },
    {
      icon: 'devcontainer',
      extensions: ['devcontainer.json', '.devcontainer.json'],
      filename: true,

    },
    {
      icon: 'dhall',
      extensions: [],

      languages: [languages.dhall],

    },
    {
      icon: 'django',
      extensions: ['djt'],
      // languages: [languages.django],
    },
    {
      icon: 'dlang',
      extensions: [],
      languages: [languages.dlang],

    },
    {
      icon: 'diff',
      extensions: [],
      languages: [languages.diff],

    },
    {
      icon: 'docker',
      extensions: ['.dockerignore'],
      filenamesGlob: [
        'compose',
        'docker-compose',
        'docker-compose.ci-build',
        'docker-compose.override',
        'docker-compose.vs.debug',
        'docker-compose.vs.release',
        'docker-cloud',
      ],
      extensionsGlob: ['yaml', 'yml'],
      filename: true,
      languages: [languages.dockerfile],

    },
    {
      icon: 'docker2',
      extensions: ['.dockerignore'],
      filenamesGlob: [
        'compose',
        'docker-compose',
        'docker-compose.ci-build',
        'docker-compose.override',
        'docker-compose.vs.debug',
        'docker-compose.vs.release',
        'docker-cloud',
      ],
      extensionsGlob: ['yaml', 'yml'],
      filename: true,
      languages: [languages.dockerfile],

    },
    {
      icon: 'dockertest',
      extensions: ['docker-compose.test.yml'],
      filename: true,

    },
    {
      icon: 'dockertest2',
      extensions: ['docker-compose.test.yml'],
      filename: true,

    },
    {
      icon: 'docpad',
      extensions: ['eco'],

    },
    {
      icon: 'docz',
      extensions: ['.doczrc'],
      filenamesGlob: ['docz', '.docz', 'doczrc', 'docz.config'],
      extensionsGlob: ['js', 'json'],
      filename: true,

    },
    {
      icon: 'dojo',
      extensions: ['.dojorc'],
      filename: true,

    },
    {
      icon: 'doxygen',
      extensions: [],
      languages: [languages.doxygen],

    },
    {
      icon: 'drawio',
      extensions: ['drawio', 'dio'],
      filenamesGlob: ['.drawio', '.dio'],
      extensionsGlob: ['png', 'svg'],

    },
    {
      icon: 'drone',
      extensions: ['.drone.yml', '.drone.yml.sig'],

      filename: true,

    },
    {
      icon: 'drools',
      extensions: [],
      languages: [languages.drools],

    },
    {
      icon: 'dotjs',
      extensions: [],
      languages: [languages.dotjs],

    },
    {
      icon: 'dustjs',
      extensions: [],
      languages: [languages.dustjs],

    },
    {
      icon: 'dvc',
      extensions: ['.dvc'],
      languages: [],
      filename: true,

    },
    {
      icon: 'dylan',
      extensions: [],
      languages: [languages.dylanlang],

    },
    {
      icon: 'editorconfig',
      extensions: ['.editorconfig'],
      filename: true,

    },
    {
      icon: 'earthly',
      extensions: ['.earthlyignore', 'Earthfile'],
      filename: true,
      languages: [languages.earthfile],

    },
    {
      icon: 'eas-metadata',
      extensions: ['store.config.json'],

      filename: true,

    },
    {
      icon: 'edge',
      extensions: [],
      languages: [languages.edge],

    },
    {
      icon: 'edge2',
      extensions: [],
      languages: [languages.edge],

    },
    {
      icon: 'eex',
      extensions: [],
      languages: [languages.eex],

    },
    { icon: 'ejs', extensions: ['ejs'] },
    {
      icon: 'elastic',
      extensions: [],
      languages: [languages.elastic],

    },
    { icon: 'elasticbeanstalk', extensions: [] },
    {
      icon: 'elixir',
      extensions: [],
      languages: [languages.elixir],

    },
    {
      icon: 'elm',
      extensions: ['elm-package.json'],
      filename: true,
      languages: [languages.elm],

    },
    {
      icon: 'elm2',
      extensions: ['elm-package.json'],
      filename: true,
      languages: [languages.elm],

    },
    { icon: 'emacs', extensions: ['el', 'elc'] },
    {
      icon: 'ember',
      extensions: ['.ember-cli'],
      filename: true,

    },
    { icon: 'ensime', extensions: ['ensime'] },
    { icon: 'eps', extensions: ['eps'] },
    {
      icon: 'erb',
      extensions: [],
      languages: [languages.erb],

    },
    {
      icon: 'erlang',
      extensions: ['emakefile', '.emakerfile'],
      filename: true,
      languages: [languages.erlang],

    },
    {
      icon: 'erlang2',
      extensions: ['emakefile', '.emakerfile'],
      filename: true,
      languages: [languages.erlang],

    },
    {
      icon: 'esbuild',
      extensions: [],
      filenamesGlob: ['esbuild', 'esbuild.config'],
      extensionsGlob: ['js', 'mjs', 'cjs', 'ts'],
      filename: true,

    },
    {
      icon: 'eslint',
      extensions: ['.eslintrc', '.eslintignore', '.eslintcache'],
      filenamesGlob: ['.eslintrc'],
      extensionsGlob: ['js', 'mjs', 'cjs', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'eslint2',
      extensions: ['.eslintrc', '.eslintignore', '.eslintcache'],
      filenamesGlob: ['.eslintrc'],
      extensionsGlob: ['js', 'mjs', 'cjs', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'excel',
      extensions: ['xls', 'xlsx', 'xlsm', 'ods', 'fods', 'xlsb'],

    },
    {
      icon: 'excel2',
      extensions: ['xls', 'xlsx', 'xlsm', 'ods', 'fods', 'xlsb'],

    },
    {
      icon: 'expo',
      extensions: [
        'app.json',
        'app.config.js',
        'app.config.json',
        'app.config.json5',
      ],

      filename: true,

    },
    {
      icon: 'falcon',
      extensions: [],
      languages: [languages.falcon],

    },
    {
      icon: 'fantasticon',
      extensions: [
        '.fantasticonrc',
        'fantasticonrc',
        '.fantasticonrc.json',
        'fantasticonrc.json',
        '.fantasticonrc.js',
        'fantasticonrc.js',
      ],
      filename: true,

    },
    {
      icon: 'fauna',
      extensions: ['.faunarc'],
      languages: [languages.fauna],
      filename: true,

    },
    {
      icon: 'favicon',
      extensions: ['favicon.ico'],
      filename: true,

    },
    { icon: 'fbx', extensions: ['fbx'] },
    {
      icon: 'firebase',
      extensions: ['.firebaserc'],
      filename: true,

    },
    {
      icon: 'firebasehosting',
      extensions: ['firebase.json'],

      filename: true,

    },
    {
      icon: 'firestore',
      extensions: ['firestore.rules', 'firestore.indexes.json'],
      filename: true,

    },
    {
      icon: 'fla',
      extensions: ['fla'],

    },
    {
      icon: 'flareact',
      extensions: [],
      filenamesGlob: ['flareact.config'],
      extensionsGlob: ['js'],
      filename: true,

    },
    { icon: 'flash', extensions: ['swf', 'swc'] },
    {
      icon: 'floobits',
      extensions: ['.flooignore'],
      filename: true,

    },
    { icon: 'flow', extensions: ['js.flow'] },
    {
      icon: 'flow',
      extensions: ['.flowconfig'],
      filename: true,

    },
    {
      icon: 'flutter',
      extensions: ['.flutter-plugins', '.metadata'],
      filename: true,

    },
    {
      icon: 'flutter_package',
      extensions: ['pubspec.lock', 'pubspec.yaml', '.packages'],
      filename: true,

    },
    {
      icon: 'font',
      extensions: ['woff', 'woff2', 'ttf', 'otf', 'eot', 'pfa', 'pfb', 'sfd'],

    },
    {
      icon: 'formkit',
      extensions: [],
      filenamesGlob: ['formkit.config'],
      extensionsGlob: ['js', 'mjs', 'cjs', 'ts'],
      filename: true,

    },
    {
      icon: 'fortran',
      extensions: [],
      languages: [languages.fortran],

    },
    {
      icon: 'fossa',
      extensions: ['.fossaignore'],
      filename: true,

    },
    {
      icon: 'fossil',
      extensions: ['ignore-glob'],
      filename: true,

    },
    {
      icon: 'fsharp',
      extensions: [],
      languages: [languages.fsharp],

    },
    { icon: 'fsproj', extensions: ['fsproj'] },
    {
      icon: 'freemarker',
      extensions: [],
      languages: [languages.freemarker],

    },
    {
      icon: 'fthtml',
      extensions: [],
      languages: [languages.fthtml],

    },
    {
      icon: 'funding',
      extensions: ['funding.yml'],
      filename: true,

    },
    {
      icon: 'fusebox',
      extensions: ['fuse.js'],
      filename: true,

    },
    {
      icon: 'galen',
      extensions: [],
      languages: [languages.galen],

    },
    {
      icon: 'galen2',
      extensions: [],
      languages: [languages.galen],

    },
    {
      icon: 'git',
      extensions: [
        '.gitattributes',
        '.gitconfig',
        '.gitignore',
        '.gitmodules',
        '.gitkeep',
        '.mailmap',
        '.issuetracker',
      ],
      filename: true,
      languages: [languages.git],

    },
    {
      icon: 'gamemaker',
      extensions: ['gmx'],
      languages: [languages.gamemaker],

    },
    {
      icon: 'gamemaker2',
      extensions: ['yy', 'yyp'],
      languages: [languages.gamemaker2],

    },
    {
      icon: 'gamemaker81',
      extensions: [],
      languages: [languages.gamemaker81],

    },
    {
      icon: 'gatsby',
      extensions: [],
      filenamesGlob: ['gatsby-browser', 'gatsby-ssr'],
      extensionsGlob: ['js', 'ts', 'tsx'],
      filename: true,

    },
    {
      icon: 'gatsby',
      extensions: [],
      filenamesGlob: ['gatsby-config', 'gatsby-node'],
      extensionsGlob: ['js', 'ts'],
      filename: true,

    },
    {
      icon: 'gcode',
      extensions: [],
      languages: [languages.gcode],

    },
    {
      icon: 'gcloud',
      extensions: ['.gcloudignore'],
      filename: true,

    },
    {
      icon: 'genstat',
      extensions: [],
      languages: [languages.genstat],

    },
    {
      icon: 'gitlab',
      extensions: ['.gitlab-ci.yml'],
      filename: true,

    },
    {
      icon: 'gitpod',
      extensions: [],
      filenamesGlob: ['.gitpod', 'gitpod'],
      extensionsGlob: ['yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'glide',
      extensions: ['glide.yml'],
      filename: true,

    },
    {
      icon: 'glitter',
      extensions: ['.glitterrc'],
      filename: true,

    },
    {
      icon: 'glsl',
      extensions: [],
      languages: [languages.glsl],

    },
    {
      icon: 'glyphs',
      extensions: [],
      languages: [languages.glyphs],

    },
    {
      icon: 'gnuplot',
      extensions: [],
      languages: [languages.gnuplot],

    },
    {
      icon: 'go',
      extensions: [],
      languages: [languages.go],

    },
    {
      icon: 'go_package',
      extensions: ['go.sum', 'go.mod'],
      filename: true,

    },
    {
      icon: 'go_work',
      extensions: ['go.work'],
      filename: true,

    },
    {
      icon: 'goctl',
      extensions: [],
      languages: [languages.goctl],

    },
    {
      icon: 'godot',
      extensions: [],
      languages: [languages.godot],

    },
    {
      icon: 'gradle',
      extensions: ['gradle'],
    },
    {
      icon: 'gradle2',
      extensions: ['gradle'],

    },
    {
      icon: 'graphql',
      extensions: ['.gqlconfig'],
      filename: true,
      languages: [languages.graphql],

    },
    {
      icon: 'graphql_config',
      extensions: ['.graphqlconfig'],
      filenamesGlob: ['.graphqlconfig'],
      extensionsGlob: ['yml', 'yaml'],
      filename: true,

    },
    {
      icon: 'graphviz',
      extensions: [],
      languages: [languages.graphviz],

    },
    {
      icon: 'greenkeeper',
      extensions: ['greenkeeper.json'],
      filename: true,

    },
    {
      icon: 'gridsome',
      extensions: [],
      filenamesGlob: ['gridsome.config', 'gridsome.server', 'gridsome.client'],
      extensionsGlob: ['js', 'ts'],
      filename: true,

    },
    {
      icon: 'groovy',
      extensions: [],
      languages: [languages.groovy],

    },
    {
      icon: 'groovy2',
      extensions: [],
      languages: [languages.groovy],

    },
    {
      icon: 'grunt',
      extensions: [],
      filenamesGlob: ['gruntfile', 'gruntfile.babel'],
      extensionsGlob: ['js', 'coffee', 'ts'],
      filename: true,

    },
    {
      icon: 'gulp',
      extensions: [],
      filenamesGlob: ['gulpfile', 'gulpfile.esm', 'gulpfile.babel'],
      extensionsGlob: ['js', 'coffee', 'ts', 'mjs'],
      filename: true,

    },
    {
      icon: 'haml',
      extensions: [],
      languages: [languages.haml],

    },
    {
      icon: 'handlebars',
      extensions: [],
      languages: [languages.handlebars],

    },
    {
      icon: 'handlebars2',
      extensions: [],
      languages: [languages.handlebars],

    },
    {
      icon: 'harbour',
      extensions: [],
      languages: [languages.harbour],

    },
    {
      icon: 'hardhat',
      extensions: [],
      filenamesGlob: ['hardhat.config'],
      extensionsGlob: ['js', 'ts'],
      filename: true,

    },
    {
      icon: 'haskell',
      extensions: [],
      languages: [languages.haskell, languages.literatehaskell],

    },
    {
      icon: 'haskell2',
      extensions: [],
      languages: [languages.haskell, languages.literatehaskell],

    },
    {
      icon: 'haxe',
      extensions: ['haxelib.json'],
      filename: true,
      languages: [languages.haxe],

    },
    {
      icon: 'haxecheckstyle',
      extensions: ['checkstyle.json'],
      filename: true,

    },
    { icon: 'haxedevelop', extensions: ['hxproj'] },
    {
      icon: 'helix',
      extensions: ['.p4ignore'],
      filename: true,

    },
    {
      icon: 'helm',
      extensions: ['chart.lock', 'chart.yaml'],
      filename: true,
      languages: [languages.helm],

    },
    {
      icon: 'hjson',
      extensions: [],
      languages: [languages.hjson],
    },
    {
      icon: 'hlsl',
      extensions: [],
      languages: [languages.hlsl],

    },
    {
      icon: 'homeassistant',
      extensions: [],
      languages: [languages.homeassistant],

    },
    {
      icon: 'horusec',
      extensions: ['horusec-config.json'],
      filename: true,

    },
    {
      icon: 'host',
      extensions: [],
      languages: [languages.hosts],

    },
    {
      icon: 'html',
      extensions: [],
      languages: [languages.html],

    },
    {
      icon: 'htmlhint',
      extensions: ['.htmlhintrc'],
      filename: true,

    },
    {
      icon: 'http',
      extensions: [],
      languages: [languages.http],

    },
    {
      icon: 'hunspell',
      extensions: [],
      languages: [languages.hunspell],

    },
    {
      icon: 'husky',
      extensions: ['.huskyrc', 'husky.config.js'],
      filenamesGlob: ['.huskyrc'],
      extensionsGlob: ['js', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'hy',
      extensions: [],
      languages: [languages.hy],

    },
    {
      icon: 'hygen',
      extensions: ['ejs.t'],

    },
    {
      icon: 'hypr',
      extensions: [],
      languages: [languages.hypr],

    },
    {
      icon: 'icl',
      extensions: [],
      languages: [languages.icl],

    },
    { icon: 'idris', extensions: ['idr', 'lidr'] },
    { icon: 'idrisbin', extensions: ['ibc'] },
    { icon: 'idrispkg', extensions: ['ipkg'] },
    {
      icon: 'image',
      extensions: ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'tiff', 'ico', 'webp'],

    },
    {
      icon: 'imba',
      extensions: ['imba', 'imba2'],
      languages: [languages.imba],

    },
    {
      icon: 'inc',
      extensions: ['inc', 'include'],

    },
    {
      icon: 'infopath',
      extensions: ['infopathxml', 'xsn', 'xsf', 'xtp2'],

    },
    {
      icon: 'informix',
      extensions: [],
      languages: [languages.informix],

    },
    {
      icon: 'ini',
      extensions: [],
      languages: [languages.ini],

    },
    {
      icon: 'ink',
      extensions: [],
      languages: [languages.ink],

    },
    {
      icon: 'innosetup',
      extensions: [],
      languages: [languages.innosetup],

    },
    {
      icon: 'ionic',
      extensions: ['ionic.project', 'ionic.config.json'],
      filename: true,

    },
    {
      icon: 'jake',
      extensions: ['jakefile', 'jakefile.js'],
      filename: true,

    },
    {
      icon: 'janet',
      extensions: [],
      languages: [languages.janet],

    },
    { icon: 'jar', extensions: ['jar'] },
    {
      icon: 'jasmine',
      extensions: ['jasmine.json'],
      filename: true,

    },
    {
      icon: 'java',
      extensions: [],
      languages: [languages.java],

    },
    { icon: 'jbuilder', extensions: ['jbuilder'] },
    {
      icon: 'jest',
      extensions: [
        'jest.config.json',
        'jest.config.base.json',
        'jest.config.common.json',
        'jest.config.ts',
        'jest.config.base.ts',
        'jest.config.common.ts',
        'jest.json',
        '.jestrc',
        '.jestrc.js',
        '.jestrc.json',
      ],
      filenamesGlob: [
        'jest.config',
        'jest.config.base',
        'jest.config.common',
        'jest.config.babel',
      ],
      extensionsGlob: ['js', 'cjs', 'mjs'],
      filename: true,

    },
    {
      icon: 'jest_snapshot',
      extensions: ['js.snap', 'jsx.snap', 'ts.snap', 'tsx.snap'],

    },
    {
      icon: 'jekyll',
      extensions: [],
      languages: [languages.jekyll],

    },
    {
      icon: 'jenkins',
      extensions: [],
      languages: [languages.jenkins],

    },
    {
      icon: 'jinja',
      extensions: [],
      languages: [languages.jinja],

    },
    {
      icon: 'jpm',
      extensions: ['.jpmignore'],
      filename: true,

    },
    {
      icon: 'js',
      extensions: [],
      languages: [languages.javascript],

    },
    {
      icon: 'js_official',
      extensions: [],
      languages: [languages.javascript],

    },
    {
      icon: 'jsbeautify',
      extensions: [
        '.jsbeautifyrc',
        'jsbeautifyrc',
        '.jsbeautify',
        'jsbeautify',
      ],
      filename: true,

    },
    {
      icon: 'jsconfig',
      extensions: ['jsconfig.json'],

      filename: true,

    },
    {
      icon: 'jscpd',
      extensions: ['.jscpd.json'],
      filenamesGlob: ['jscpd-report'],
      extensionsGlob: ['xml', 'json', 'html'],
      filename: true,

    },
    {
      icon: 'jshint',
      extensions: ['.jshintrc', '.jshintignore'],
      filename: true,

    },
    {
      icon: 'jsmap',
      extensions: ['js.map', 'cjs.map', 'mjs.map'],

    },
    {
      icon: 'json',
      extensions: ['jsonl', 'ndjson'],
      languages: [languages.json, languages.textmatejson, languages.jsonc],

    },
    {
      icon: 'json_official',
      extensions: ['jsonl', 'ndjson'],
      languages: [languages.json, languages.textmatejson, languages.jsonc],

    },
    {
      icon: 'json2',
      extensions: ['jsonl', 'ndjson'],
      languages: [languages.json, languages.textmatejson, languages.jsonc],

    },
    {
      icon: 'jsonnet',
      extensions: [],
      languages: [languages.jsonnet],

    },
    {
      icon: 'json5',
      extensions: ['json5'],
      languages: [languages.json5],

    },
    {
      icon: 'jsonld',
      extensions: ['jsonld', 'json-ld'],

    },
    { icon: 'jsp', extensions: ['jsp'] },
    { icon: 'jss', extensions: ['jss'] },
    {
      icon: 'julia',
      extensions: [],
      languages: [languages.julia],

    },
    {
      icon: 'julia2',
      extensions: [],
      languages: [languages.julia],

    },
    { icon: 'jupyter', extensions: ['ipynb'] },
    {
      icon: 'io',
      extensions: [],
      languages: [languages.io],

    },
    {
      icon: 'iodine',
      extensions: [],
      languages: [languages.iodine],

    },
    {
      icon: 'k',
      extensions: [],
      languages: [languages.k],

    },
    {
      icon: 'karma',
      extensions: [],
      filenamesGlob: ['karma.conf'],
      extensionsGlob: ['js', 'coffee', 'ts'],
      filename: true,

    },
    { icon: 'key', extensions: ['key', 'pem'] },
    {
      icon: 'kite',
      extensions: ['.kiteignore'],

      filename: true,

    },
    {
      icon: 'kitchenci',
      extensions: ['.kitchen.yml', 'kitchen.yml'],
      filename: true,

    },
    {
      icon: 'kivy',
      extensions: [],
      languages: [languages.kivy],

    },
    {
      icon: 'kos',
      extensions: [],
      languages: [languages.kos],

    },
    {
      icon: 'kotlin',
      extensions: [],
      languages: [languages.kotlin],

    },
    {
      icon: 'kusto',
      extensions: [],
      languages: [languages.kusto],

    },
    {
      icon: 'latino',
      extensions: [],
      languages: [languages.latino],

    },
    {
      icon: 'layout',
      extensions: ['master', 'layout.html', 'layout.htm'],

    },
    {
      icon: 'layout',
      extensions: ['layout.html', 'layout.htm'],
      filename: true,

    },
    {
      icon: 'lerna',
      extensions: ['lerna.json'],

      filename: true,

    },
    {
      icon: 'less',
      extensions: [],
      languages: [languages.less],

    },
    {
      icon: 'lex',
      extensions: [],
      languages: [languages.lex],

    },
    {
      icon: 'license',
      extensions: ['enc', 'license', 'lic'],

    },
    {
      icon: 'license',
      extensions: [
        'license',
        'licence',
        'copying',
        'copying.lesser',
        'license-mit',
        'license-apache',
      ],
      filenamesGlob: [
        'license',
        'licence',
        'copying',
        'copying.lesser',
        'license-mit',
        'license-apache',
      ],
      extensionsGlob: ['md', 'txt'],
      filename: true,

    },
    {
      icon: 'licensebat',
      extensions: ['.licrc'],
      filename: true,

    },
    {
      icon: 'lighthouse',
      extensions: [],
      filenamesGlob: ['.lighthouserc'],
      extensionsGlob: ['js', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'lilypond',
      extensions: [],
      languages: [languages.lilypond],

    },
    {
      icon: 'lisp',
      extensions: [],
      languages: [languages.lisp],

    },
    { icon: 'lime', extensions: ['hxp'] },
    {
      icon: 'lime',
      extensions: ['include.xml'],
      filename: true,

    },
    {
      icon: 'lintstagedrc',
      extensions: [
        '.lintstagedrc',
        '.lintstagedrc.json',
        '.lintstagedrc.yaml',
        '.lintstagedrc.yml',
        '.lintstagedrc.mjs',
        '.lintstagedrc.js',
        '.lintstagedrc.cjs',
        'lint-staged.config.mjs',
        'lint-staged.config.js',
        'lint-staged.config.cjs',
      ],
      filename: true,

    },
    { icon: 'liquid', extensions: ['liquid'] },
    { icon: 'livescript', extensions: ['ls'] },
    { icon: 'lnk', extensions: ['lnk'] },
    { icon: 'locale', extensions: [] },
    { icon: 'log', extensions: ['log', 'tlg'] },
    {
      icon: 'log',
      extensions: ['log', 'tlg'],
      languages: [languages.log],

    },
    {
      icon: 'lolcode',
      extensions: [],
      languages: [languages.lolcode],

    },
    {
      icon: 'lsl',
      extensions: [],
      languages: [languages.lsl],

    },
    {
      icon: 'lua',
      extensions: [],
      languages: [languages.lua],

    },
    {
      icon: 'luau',
      extensions: ['luau'],

    },
    { icon: 'lync', extensions: ['crec', 'ocrec'] },
    {
      icon: 'makefile',
      extensions: ['makefile'],
      languages: [languages.makefile],

    },
    {
      icon: 'manifest',
      extensions: ['manifest'],
      filename: true,

    },
    {
      icon: 'manifest_skip',
      extensions: ['manifest.skip'],
      filename: true,

    },
    {
      icon: 'manifest_bak',
      extensions: ['manifest.bak'],
      filename: true,

    },
    { icon: 'map', extensions: ['map'] },
    {
      icon: 'markdown',
      extensions: ['mdown', 'markdown'],
      languages: [languages.markdown],

    },
    {
      icon: 'markdownlint',
      filename: true,
      extensions: ['.markdownlintrc'],
      filenamesGlob: ['.markdownlint', '.markdownlint-cli2'],
      extensionsGlob: ['json', 'jsonc', 'yml', 'yaml', 'cjs'],

    },
    {
      icon: 'markdownlint_ignore',
      extensions: ['.markdownlintignore'],
      filename: true,

    },
    {
      icon: 'marko',
      extensions: [],
      languages: [languages.marko],

    },
    { icon: 'markojs', extensions: ['marko.js'] },
    {
      icon: 'matlab',
      extensions: [
        'fig',
        'mex',
        'mexn',
        'mexrs6',
        'mn',
        'mum',
        'mx',
        'mx3',
        'rwd',
        'slx',
        'slddc',
        'smv',
        'xvc',
      ],
      languages: [languages.matlab],

    },
    {
      icon: 'maxscript',
      extensions: [],
      languages: [languages.maxscript],

    },
    {
      icon: 'maven',
      extensions: ['maven.config'],
      filenamesGlob: ['pom', 'extensions', 'settings'],
      extensionsGlob: ['xml'],
      filename: true,

    },
    {
      icon: 'maya',
      extensions: [],
      languages: [languages.mel],

    },
    {
      icon: 'mdx',
      extensions: [],
      languages: [languages.mdx],

    },
    {
      icon: 'mediawiki',
      extensions: [],
      languages: [languages.mediawiki],

    },
    {
      icon: 'mercurial',
      extensions: ['.hgignore'],
      filename: true,

    },
    {
      icon: 'meson',
      extensions: [],
      languages: [languages.meson],

    },
    { icon: 'meteor', extensions: [] },
    {
      icon: 'mjml',
      extensions: [],
      languages: [languages.mjml],

    },
    {
      icon: 'mlang',
      extensions: [],
      languages: [languages.mlang],

    },
    {
      icon: 'mocha',
      extensions: ['mocha.opts'],
      filenamesGlob: ['.mocharc'],
      extensionsGlob: ['js', 'json', 'jsonc', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'modernizr',
      extensions: ['modernizr'],
      filenamesGlob: ['modernizr', 'modernizrrc', '.modernizr', '.modernizrrc'],
      extensionsGlob: ['js'],
      filename: true,

    },
    {
      icon: 'mojolicious',
      extensions: [],
      languages: [languages.mojolicious],

    },
    {
      icon: 'moleculer',
      extensions: [],
      filenamesGlob: ['moleculer.config'],
      extensionsGlob: ['js', 'json', 'ts'],
      filename: true,

    },
    {
      icon: 'mongo',
      extensions: [],
      languages: [languages.mongo],

    },
    {
      icon: 'monotone',
      extensions: ['.mtn-ignore'],
      filename: true,

    },
    {
      icon: 'mson',
      extensions: [],
      languages: [languages.mson],

    },
    {
      icon: 'mustache',
      extensions: ['mustache', 'mst'],

    },
    {
      icon: 'ndst',
      extensions: ['ndst.yaml', 'ndst.yml', 'ndst.json'],

    },
    {
      icon: 'nearly',
      extensions: [],
      languages: [languages.nearley],

    },
    {
      icon: 'nestjs',
      extensions: [
        '.nest-cli.json',
        'nest-cli.json',
        'nestconfig.json',
        '.nestconfig.json',
      ],
      filename: true,

    },
    {
      icon: 'nest_adapter_js',
      extensions: ['adapter.js'],

    },
    {
      icon: 'nest_adapter_ts',
      extensions: ['adapter.ts'],

    },
    {
      icon: 'nest_controller_js',
      extensions: ['controller.js'],

    },
    {
      icon: 'nest_controller_ts',
      extensions: ['controller.ts'],

    },
    {
      icon: 'nest_decorator_js',
      extensions: ['decorator.js'],

    },
    {
      icon: 'nest_decorator_ts',
      extensions: ['decorator.ts'],

    },
    {
      icon: 'nest_filter_js',
      extensions: ['filter.js'],

    },
    {
      icon: 'nest_filter_ts',
      extensions: ['filter.ts'],

    },
    {
      icon: 'nest_gateway_js',
      extensions: ['gateway.js'],

    },
    {
      icon: 'nest_gateway_ts',
      extensions: ['gateway.ts'],

    },
    {
      icon: 'nest_guard_js',
      extensions: ['guard.js'],

    },
    {
      icon: 'nest_guard_ts',
      extensions: ['guard.ts'],

    },
    {
      icon: 'nest_interceptor_js',
      extensions: ['interceptor.js'],

    },
    {
      icon: 'nest_interceptor_ts',
      extensions: ['interceptor.ts'],

    },
    {
      icon: 'nest_middleware_js',
      extensions: ['middleware.js'],

    },
    {
      icon: 'nest_middleware_ts',
      extensions: ['middleware.ts'],

    },
    {
      icon: 'nest_module_js',
      extensions: ['module.js'],

    },
    {
      icon: 'nest_module_ts',
      extensions: ['module.ts'],

    },
    {
      icon: 'nest_pipe_js',
      extensions: ['pipe.js'],

    },
    {
      icon: 'nest_pipe_ts',
      extensions: ['pipe.ts'],

    },
    {
      icon: 'nest_service_js',
      extensions: ['service.js'],

    },
    {
      icon: 'nest_service_ts',
      extensions: ['service.ts'],

    },
    {
      icon: 'netlify',
      extensions: ['netlify.toml'],
      filename: true,

    },
    {
      icon: 'next',
      extensions: ['next.config.js', 'next.config.mjs'],
      filename: true,

    },
    {
      icon: 'nginx',
      extensions: ['nginx.conf'],
      filename: true,

    },
    {
      icon: 'nim',
      extensions: [],
      languages: [languages.nim],

    },
    {
      icon: 'nimble',
      extensions: [],
      languages: [languages.nimble],

    },
    {
      icon: 'ninja',
      extensions: ['build.ninja'],
      filename: true,

    },
    {
      icon: 'noc',
      extensions: ['noc'],

    },
    {
      icon: 'nix',
      extensions: [],
      languages: [languages.nix],

    },
    { icon: 'njsproj', extensions: ['njsproj'] },
    {
      icon: 'node',
      extensions: ['.node-version', '.nvmrc'],
      filename: true,

    },
    {
      icon: 'node2',
      extensions: ['.node-version', '.nvmrc'],
      filename: true,

    },
    {
      icon: 'nodemon',
      extensions: ['nodemon.json'],
      filename: true,

    },
    {
      icon: 'npm',
      extensions: [
        '.npmignore',
        '.npmrc',
        'package.json',
        'package-lock.json',
        'npm-shrinkwrap.json',
      ],
      filename: true,

    },
    {
      icon: 'nsi',
      extensions: [],
      languages: [languages.nsis],

    },
    {
      icon: 'nsri',
      extensions: ['.nsrirc', '.nsriignore', 'nsri.config.js'],
      filenamesGlob: ['.nsrirc'],
      extensionsGlob: ['js', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'nsri-integrity',
      extensions: ['.integrity.json'],
      filename: true,

    },
    {
      icon: 'nuget',
      extensions: ['nupkg', 'snupkg', 'nuspec', 'psmdcp'],

    },
    {
      icon: 'numpy',
      extensions: ['npy', 'npz'],

    },
    {
      icon: 'nunjucks',
      extensions: ['nunj', 'njs'],
      languages: [languages.nunjucks],

    },
    {
      icon: 'nuxt',
      extensions: [],
      filenamesGlob: ['nuxt.config'],
      extensionsGlob: ['js', 'ts'],
      filename: true,

    },
    {
      icon: 'nx',
      extensions: [],
      filenamesGlob: ['nx'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'nyc',
      extensions: ['.nycrc', '.nycrc.json'],
      filename: true,

    },
    {
      icon: 'objectivec',
      extensions: [],
      languages: [languages.objectivec],

    },
    {
      icon: 'objectivecpp',
      extensions: [],
      languages: [languages.objectivecpp],

    },
    {
      icon: 'objidconfig',
      extensions: ['.objidconfig'],

      filename: true,

    },
    {
      icon: 'ocaml',
      extensions: ['.merlin'],
      filename: true,
      languages: [languages.ocaml],

    },
    {
      icon: 'ogone',
      extensions: [],
      languages: [languages.ogone],

    },
    {
      icon: 'onenote',
      extensions: ['one', 'onepkg', 'onetoc', 'onetoc2', 'sig'],

    },
    {
      icon: 'openscad',
      extensions: [],
      languages: [languages.scad],

    },
    { icon: 'opencl', extensions: ['cl', 'opencl'] },
    {
      icon: 'openHAB',
      extensions: [],
      languages: [languages.openHAB],

    },
    { icon: 'org', extensions: ['org'] },
    {
      icon: 'outlook',
      extensions: ['pst', 'bcmx', 'otm', 'msg', 'oft'],

    },
    { icon: 'ovpn', extensions: ['ovpn'] },
    { icon: 'package', extensions: ['pkg'] },
    {
      icon: 'paket',
      extensions: [],
      filenamesGlob: ['paket'],
      extensionsGlob: [
        'dependencies',
        'lock',
        'references',
        'template',
        'local',
      ],
      filename: true,

    },
    { icon: 'patch', extensions: ['patch'] },
    {
      icon: 'pcl', extensions: ['pcd'],
    },
    {
      icon: 'pddl',
      extensions: [],
      languages: [languages.pddl],

    },
    {
      icon: 'pddl_plan',
      extensions: [],
      languages: [languages.pddlplan],

    },
    {
      icon: 'pddl_happenings',
      extensions: [],
      languages: [languages.pddlhappenings],

    },
    { icon: 'pdf', extensions: ['pdf'] },
    {
      icon: 'pdf2',
      extensions: ['pdf'],

    },
    {
      // Taken from https://peeky.dev/logo.svg
      icon: 'peeky',
      // See: https://peeky.dev/guide/config.html
      extensions: ['peeky.config.ts', 'peeky.config.js', 'peeky.config.mjs'],
      filename: true,

    },
    {
      icon: 'perl',
      extensions: [],
      languages: [languages.perl],

    },
    {
      icon: 'perl2',
      extensions: [],
      languages: [languages.perl],

    },
    {
      icon: 'perl6',
      extensions: [],
      languages: [languages.perl6],

    },
    {
      icon: 'pgsql',
      extensions: [],
      languages: [languages.pgsql],

    },
    { icon: 'photoshop', extensions: ['psd'] },
    {
      icon: 'photoshop2',
      extensions: ['psd'],

    },
    {
      icon: 'php',
      extensions: [
        'php1',
        'php2',
        'php3',
        'php4',
        'php5',
        'php6',
        'phps',
        'phpsa',
        'phpt',
        'phtml',
        'phar',
      ],
      languages: [languages.php],

    },
    {
      icon: 'php2',
      extensions: [
        'php1',
        'php2',
        'php3',
        'php4',
        'php5',
        'php6',
        'phps',
        'phpsa',
        'phpt',
        'phtml',
        'phar',
      ],
      languages: [languages.php],

    },
    {
      icon: 'php3',
      extensions: [
        'php1',
        'php2',
        'php3',
        'php4',
        'php5',
        'php6',
        'phps',
        'phpsa',
        'phpt',
        'phtml',
        'phar',
      ],
      languages: [languages.php],

    },
    {
      icon: 'phpcsfixer',
      extensions: ['.php_cs', '.php_cs.dist'],
      filename: true,

    },
    {
      icon: 'phpstan',
      extensions: [],
      filenamesGlob: ['phpstan', 'phpstan.dist'],
      extensionsGlob: ['neon'],
      filename: true,

    },
    {
      icon: 'phpunit',
      extensions: ['phpunit', 'phpunit.xml', 'phpunit.xml.dist'],
      filename: true,

    },
    {
      icon: 'phraseapp',
      extensions: ['.phraseapp.yml'],
      filename: true,

    },
    {
      icon: 'pine',
      extensions: [],
      languages: [languages.pine],

    },
    {
      icon: 'pip',
      extensions: ['pipfile', 'pipfile.lock'],
      languages: [languages.pip],
      filename: true,

    },
    {
      icon: 'pipeline',
      extensions: ['pipeline'],

    },
    {
      icon: 'platformio',
      extensions: ['platformio.ini'],
      filename: true,
      languages: [languages.platformio],

    },
    {
      icon: 'plantuml',
      extensions: ['pu', 'plantuml', 'iuml', 'puml'],

    },
    {
      icon: 'playwright',
      extensions: [],
      filenamesGlob: ['playwright.config'],
      extensionsGlob: ['js', 'ts'],
      filename: true,

    },
    {
      icon: 'plsql',
      extensions: [],
      languages: [languages.plsql],

    },
    { icon: 'plsql_package', extensions: ['pck'] },
    { icon: 'plsql_package_body', extensions: ['pkb'] },
    {
      icon: 'plsql_package_header',
      extensions: ['pkh'],

    },
    { icon: 'plsql_package_spec', extensions: ['pks'] },
    {
      icon: 'pm2',
      extensions: [],
      filenamesGlob: ['ecosystem.config'],
      extensionsGlob: ['js', 'cjs', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'pnpm',
      extensions: ['pnpmfile.js', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'],

      filename: true,

    },
    { icon: 'poedit', extensions: ['po', 'mo'] },
    {
      icon: 'polymer',
      extensions: [],
      languages: [languages.polymer],

    },
    {
      icon: 'pony',
      extensions: [],
      languages: [languages.pony],

    },
    {
      icon: 'postcss',
      extensions: [],
      languages: [languages.postcss],

    },
    {
      icon: 'postcssconfig',
      extensions: [
        '.postcssrc',
        '.postcssrc.json',
        '.postcssrc.yaml',
        '.postcssrc.yml',
        '.postcssrc.ts',
        '.postcssrc.js',
        '.postcssrc.cjs',
        'postcss.config.ts',
        'postcss.config.js',
        'postcss.config.cjs',
      ],
      filename: true,

    },
    {
      icon: 'powerpoint',
      extensions: [
        'pot',
        'potx',
        'potm',
        'pps',
        'ppsx',
        'ppsm',
        'ppt',
        'pptx',
        'pptm',
        'pa',
        'ppa',
        'ppam',
        'sldm',
        'sldx',
      ],

    },
    {
      icon: 'powerpoint2',
      extensions: [
        'pot',
        'potx',
        'potm',
        'pps',
        'ppsx',
        'ppsm',
        'ppt',
        'pptx',
        'pptm',
        'pa',
        'ppa',
        'ppam',
        'sldm',
        'sldx',
      ],

    },
    {
      icon: 'powershell',
      extensions: [],
      languages: [languages.powershell],

    },
    {
      icon: 'powershell_psm',
      extensions: ['psm1'],

    },
    {
      icon: 'powershell_psd',
      extensions: ['psd1'],

    },
    {
      icon: 'powershell_format',
      extensions: ['format.ps1xml'],

    },
    {
      icon: 'powershell_types',
      extensions: ['types.ps1xml'],

    },
    {
      icon: 'powershell2',
      extensions: [],
      languages: [languages.powershell],

    },
    {
      icon: 'powershell_psm2',
      extensions: ['psm1'],

    },
    {
      icon: 'powershell_psd2',
      extensions: ['psd1'],

    },
    {
      icon: 'preact',
      extensions: [],
      filenamesGlob: ['preact.config'],
      extensionsGlob: ['js'],
      filename: true,

    },
    {
      icon: 'precommit',
      extensions: ['.pre-commit-config.yaml'],
      filename: true,

    },
    {
      icon: 'prettier',
      extensions: ['.prettierrc', '.prettierignore'],

      filename: true,

    },
    {
      icon: 'prettier',
      extensions: [],
      filenamesGlob: ['prettier.config'],
      extensionsGlob: ['js', 'cjs', 'ts', 'coffee'],

      filename: true,

    },
    {
      icon: 'prettier',
      extensions: [],
      filenamesGlob: ['.prettierrc'],
      extensionsGlob: ['js', 'cjs', 'json', 'json5', 'yml', 'yaml', 'toml'],

      filename: true,

    },
    {
      icon: 'prisma',
      extensions: [],
      languages: [languages.prisma],

    },
    {
      icon: 'processinglang',
      extensions: [],
      languages: [languages.processinglang],

    },
    {
      icon: 'procfile',
      extensions: ['procfile'],
      filename: true,

    },
    {
      icon: 'progress',
      extensions: [],
      languages: [languages.openEdge],

    },
    {
      icon: 'prolog',
      extensions: ['pro'],
      languages: [languages.prolog],

    },
    {
      icon: 'prometheus',
      extensions: [],
      languages: [languages.prometheus],

    },
    {
      icon: 'protobuf',
      extensions: [],
      languages: [languages.protobuf],

    },
    {
      icon: 'protractor',
      extensions: [],
      filenamesGlob: ['protractor.conf'],
      extensionsGlob: ['js', 'coffee', 'ts'],
      filename: true,

    },
    { icon: 'publisher', extensions: ['pub', 'puz'] },
    {
      icon: 'pug',
      extensions: [
        '.jade-lintrc',
        '.pug-lintrc',
        '.jade-lint.json',
        '.pug-lintrc.js',
        '.pug-lintrc.json',
      ],
      filename: true,
      languages: [languages.pug],

    },
    {
      icon: 'pulumi',
      extensions: [],
      filenamesGlob: ['Pulumi', 'Pulumi.dev', 'Pulumi.prod'],
      extensionsGlob: ['yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'puppet',
      extensions: [],
      languages: [languages.puppet],

    },
    {
      icon: 'purescript',
      extensions: [],
      languages: [languages.purescript],

    },
    {
      icon: 'pyret',
      extensions: [],
      languages: [languages.pyret],

    },
    {
      icon: 'python',
      extensions: [],
      languages: [languages.python],

    },
    {
      icon: 'pytyped',
      extensions: ['py.typed'],
      filename: true,

    },
    {
      icon: 'pyup',
      extensions: ['.pyup', '.pyup.yml'],
      filename: true,

    },
    { icon: 'q', extensions: ['q'] },
    { icon: 'qbs', extensions: ['qbs'] },
    {
      icon: 'qlikview',
      extensions: ['qvd', 'qvw'],
      languages: [languages.qlik],

    },
    {
      icon: 'qml',
      extensions: [],
      languages: [languages.qml],

    },
    {
      icon: 'qmldir',
      extensions: ['qmldir'],
      filename: true,

    },
    {
      icon: 'qsharp',
      extensions: [],
      languages: [languages.qsharp],

    },
    {
      icon: 'quasar',
      extensions: ['quasar.config.js', 'quasar.conf.js'],

      filename: true,

    },
    {
      icon: 'r',
      extensions: [],
      languages: [languages.r],

    },
    {
      icon: 'racket',
      extensions: [],
      languages: [languages.racket],

    },
    { icon: 'rails', extensions: [] },
    { icon: 'rake', extensions: ['rake'] },
    {
      icon: 'rake',
      extensions: ['rakefile'],
      filename: true,

    },
    {
      icon: 'raml',
      extensions: [],
      languages: [languages.raml],

    },
    {
      icon: 'razor',
      extensions: [],
      languages: [languages.razor],

    },
    {
      icon: 'razzle',
      extensions: [],
      filenamesGlob: ['razzle.config'],
      extensionsGlob: ['js'],

      filename: true,

    },
    {
      icon: 'reactjs',
      extensions: [],
      languages: [languages.javascriptreact],

    },
    { icon: 'reacttemplate', extensions: ['rt'] },
    {
      icon: 'reactts',
      extensions: [],
      languages: [languages.typescriptreact],

    },
    {
      icon: 'reason',
      extensions: [],
      languages: [languages.reason],

    },
    {
      icon: 'red',
      extensions: [],
      languages: [languages.red],

    },
    { icon: 'registry', extensions: ['reg'] },
    {
      icon: 'rego',
      extensions: ['rego'],

    },
    {
      icon: 'rehype',
      extensions: ['.rehyperc', '.rehypeignore'],
      filenamesGlob: ['.rehyperc'],
      extensionsGlob: ['cjs', 'js', 'json', 'mjs', 'yml', 'yaml'],

      filename: true,

    },
    {
      icon: 'remark',
      extensions: ['.remarkrc', '.remarkignore'],
      filenamesGlob: ['.remarkrc'],
      extensionsGlob: ['cjs', 'js', 'json', 'mjs', 'yml', 'yaml'],

      filename: true,

    },
    {
      icon: 'renovate',
      extensions: ['.renovaterc'],
      filenamesGlob: ['renovate', '.renovaterc'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'replit',
      extensions: ['.replit', 'replit.nix'],
      filename: true,

    },
    {
      icon: 'rescript',
      extensions: [],
      languages: [languages.rescript],

    },
    {
      icon: 'rest',
      extensions: [],
      languages: [languages.restructuredtext],

    },
    {
      icon: 'retext',
      extensions: ['.retextrc', '.retextignore'],
      filenamesGlob: ['.retextrc'],
      extensionsGlob: ['cjs', 'js', 'json', 'mjs', 'yml', 'yaml'],

      filename: true,

    },
    {
      icon: 'rexx',
      extensions: [],
      languages: [languages.rexx],

    },
    {
      icon: 'riot',
      extensions: [],
      languages: [languages.riot],

    },
    {
      icon: 'robotframework',
      extensions: [],
      languages: [languages.robot],

    },
    {
      icon: 'robots',
      extensions: ['robots.txt'],
      filename: true,

    },
    {
      icon: 'rollup',
      extensions: [],
      filenamesGlob: [
        'rollup.config',
        'rollup.config.common',
        'rollup.config.dev',
        'rollup.config.prod',
      ],
      extensionsGlob: ['js', 'cjs', 'mjs', 'coffee', 'ts'],
      filename: true,

    },
    {
      icon: 'ron',
      extensions: ['ron'],

    },
    {
      icon: 'rmd',
      extensions: [],
      languages: [languages.rmd],

    },
    { icon: 'rproj', extensions: ['rproj'] },
    {
      icon: 'rspec',
      extensions: ['.rspec'],
      filename: true,

    },
    {
      icon: 'rubocop',
      extensions: ['.rubocop.yml', '.rubocop_todo.yml'],
      filename: true,

    },
    {
      icon: 'ruby',
      extensions: [],
      languages: [languages.ruby],

    },
    {
      icon: 'rust',
      extensions: [],
      languages: [languages.rust],

    },
    {
      icon: 'rust_toolchain',
      extensions: ['rust-toolchain'],
      filename: true,

    },
    {
      icon: 'sails',
      extensions: ['.sailsrc'],
      filename: true,

    },
    { icon: 'saltstack', extensions: ['sls'] },
    {
      icon: 'san',
      extensions: [],
      languages: [languages.san],

    },
    {
      icon: 'sas',
      extensions: [],
      languages: [languages.sas],

    },
    { icon: 'sass', extensions: ['sass'] },
    {
      icon: 'sbt',
      extensions: [],
      languages: [languages.sbt],

    },
    {
      icon: 'scala',
      extensions: [],
      languages: [languages.scala],

    },
    {
      icon: 'script',
      extensions: [],
      languages: [languages.vbscript],

    },
    {
      icon: 'scss',
      extensions: ['scssm'],
      languages: [languages.scss],

    },
    {
      icon: 'scilab',
      extensions: [],
      languages: [languages.scilab],

    },
    {
      icon: 'sdlang',
      extensions: [],
      languages: [languages.sdlang],

    },
    {
      icon: 'sentry',
      extensions: ['.sentryclirc'],
      filename: true,

    },
    {
      icon: 'serverless',
      extensions: [],
      filenamesGlob: ['serverless'],
      extensionsGlob: ['yml', 'json', 'js', 'ts'],
      filename: true,

    },
    {
      icon: 'sequelize',
      extensions: ['.sequelizerc'],
      filenamesGlob: ['.sequelizerc'],
      extensionsGlob: ['js', 'json'],
      filename: true,

    },
    {
      icon: 'shaderlab',
      extensions: ['unity'],
      languages: [languages.shaderlab],

    },
    {
      icon: 'shell',
      extensions: ['fish'],
      languages: [languages.shellscript],

    },
    {
      icon: 'siyuan',
      extensions: ['sy'],

    },
    { icon: 'sketch', extensions: ['sketch'] },
    {
      icon: 'slang',
      extensions: [],
      languages: [languages.slang],

    },
    {
      icon: 'slashup',
      extensions: [],
      filenamesGlob: ['slash-up.config'],
      extensionsGlob: ['js'],
      filename: true,

    },
    {
      icon: 'slice',
      extensions: [],
      languages: [languages.slice],

    },
    {
      icon: 'slim',
      extensions: [],
      languages: [languages.slim],

    },
    { icon: 'sln', extensions: ['sln'] },
    {
      icon: 'sln2',
      extensions: ['sln'],

    },
    {
      icon: 'silverstripe',
      extensions: [],
      languages: [languages.silverstripe],

    },
    {
      icon: 'skipper',
      extensions: ['eskip'],
      languages: [languages.skipper],

    },
    {
      icon: 'smarty',
      extensions: [],
      languages: [languages.smarty],

    },
    {
      icon: 'snapcraft',
      extensions: ['snapcraft.yaml'],
      filename: true,

    },
    {
      icon: 'snort',
      extensions: [],
      languages: [languages.snort],

    },
    {
      icon: 'snyk',
      extensions: ['.snyk'],
      filename: true,

    },
    {
      icon: 'solidarity',
      extensions: ['.solidarity', '.solidarity.json'],
      filename: true,

    },
    {
      icon: 'solidity',
      extensions: [],
      languages: [languages.solidity],

    },
    { icon: 'source', extensions: [] },
    {
      icon: 'spacengine',
      extensions: ['spe'],

    },
    {
      icon: 'sparql',
      extensions: [],
      languages: [languages.sparql],

    },
    {
      icon: 'sqf',
      extensions: [],
      languages: [languages.sqf],

    },
    {
      icon: 'sql',
      extensions: [],
      languages: [languages.sql],

    },
    {
      icon: 'sqlite',
      extensions: ['sqlite', 'sqlite3', 'db3'],

    },
    {
      icon: 'squirrel',
      extensions: [],
      languages: [languages.squirrel],

    },
    { icon: 'sss', extensions: ['sss'] },
    {
      icon: 'stan',
      extensions: [],
      languages: [languages.stan],

    },
    {
      icon: 'stata',
      extensions: ['dta'],
      languages: [languages.stata],

    },
    {
      icon: 'stencil',
      extensions: [],
      languages: [languages.stencil, languages.stencilhtml],

    },
    {
      icon: 'stryker',
      extensions: [],
      filenamesGlob: [
        'stryker.conf',
        '.stryker.conf',
        'stryker-config',
        'stryker4s',
      ],
      extensionsGlob: ['mjs', 'cjs', 'js', 'conf', 'json'],
      filename: true,

    },
    { icon: 'style', extensions: [] },
    {
      icon: 'stylelint',
      extensions: ['.stylelintrc', '.stylelintignore', '.stylelintcache'],
      filenamesGlob: ['stylelint.config', '.stylelintrc'],
      extensionsGlob: ['js', 'json', 'yaml', 'yml', 'ts', 'cjs'],

      filename: true,

    },
    {
      icon: 'stylable',
      extensions: [],
      languages: [languages.stylable],

    },
    {
      icon: 'styled',
      extensions: [],
      languages: [languages.styled],

    },
    {
      icon: 'stylish_haskell',
      extensions: ['.stylish-haskell.yaml'],
      filename: true,

    },
    {
      icon: 'stylus',
      extensions: [],
      languages: [languages.stylus],

    },
    { icon: 'storyboard', extensions: ['storyboard'] },
    {
      icon: 'storybook',
      extensions: [],
      filenamesGlob: ['story', 'stories'],
      extensionsGlob: ['js', 'jsx', 'ts', 'tsx', 'mdx'],

    },
    {
      icon: 'subversion',
      extensions: ['.svnignore'],
      filename: true,

    },
    {
      icon: 'svelte',
      extensions: [],
      languages: [languages.svelte],

    },
    { icon: 'svg', extensions: ['svg'] },
    {
      icon: 'swagger',
      extensions: [],
      languages: [languages.swagger],

    },
    {
      icon: 'swift',
      extensions: ['package.pins'],
      filename: true,
      languages: [languages.swift],

    },
    {
      icon: 'swig',
      extensions: [],
      languages: [languages.swig],

    },
    {
      icon: 'symfony',
      extensions: ['symfony.lock'],

      filename: true,

    },
    {
      icon: 'systemd',
      extensions: [],
      languages: [languages.systemd],

    },
    {
      icon: 'systemverilog',
      extensions: [],
      languages: [languages.systemverilog],

    },
    {
      icon: 't4tt',
      extensions: [],
      languages: [languages.t4],

    },
    {
      icon: 'tailwind',
      languages: [languages.tailwindcss],
      extensions: [],
      filenamesGlob: [
        'tailwind',
        'tailwind.config',
        '.tailwind',
        '.tailwindrc',
      ],
      extensionsGlob: ['js', 'cjs', 'coffee', 'ts', 'json'],
      filename: true,

    },
    {
      icon: 'tauri',
      extensions: ['tauri.conf.json'],
      filename: true,

    },
    {
      icon: 'teal',
      extensions: [],
      languages: [languages.teal],

    },
    {
      icon: 'tt',
      extensions: ['tt2'],
      languages: [languages.templatetoolkit],

    },
    { icon: 'tcl', extensions: ['tcl', 'exp'] },
    {
      icon: 'tera',
      extensions: [],
      languages: [languages.tera],

    },
    {
      icon: 'terraform',
      extensions: ['tfstate', 'tfvars', 'tf', 'tf.json'],
      languages: [languages.terraform],

    },
    { icon: 'test', extensions: ['tst'] },
    {
      icon: 'testcafe',
      extensions: ['.testcaferc.json'],
      filename: true,

    },
    {
      icon: 'testjs',
      extensions: [],
      filenamesGlob: ['test', 'spec'],
      extensionsGlob: ['js', 'jsx', 'mjs'],

    },
    {
      icon: 'testts',
      extensions: [],
      filenamesGlob: ['test', 'spec', 'e2e-test', 'e2e-spec'],
      extensionsGlob: ['ts', 'tsx'],

    },
    {
      icon: 'tex',
      extensions: ['texi', 'tikz'],
      languages: [
        languages.tex,
        languages.latex,
        languages.bibtex,
        languages.doctex,
      ],

    },
    {
      icon: 'text',
      extensions: ['csv', 'tsv'],
      languages: [languages.plaintext],

    },
    {
      icon: 'textile',
      extensions: [],
      languages: [languages.textile],

    },
    {
      icon: 'tiltfile',
      extensions: [],
      languages: [languages.tiltfile],

    },
    {
      icon: 'tfs',
      extensions: ['.tfignore'],
      filename: true,

    },
    {
      icon: 'todo', extensions: ['todo'],
    },
    {
      icon: 'toit',
      extensions: [],
      languages: [languages.toit],
      filename: true,

    },
    {
      icon: 'toml',
      extensions: [],
      languages: [languages.toml],

    },
    {
      icon: 'tox',
      extensions: ['tox.ini'],
      filename: true,

    },
    {
      icon: 'travis',
      extensions: ['.travis.yml'],
      filename: true,

    },
    {
      icon: 'trunk',
      extensions: ['trunk.yaml'],
      filename: true,

    },
    {
      icon: 'tsconfig',
      extensions: [],
      filenamesGlob: [
        'tsconfig',
        'tsconfig.app',
        'tsconfig.base',
        'tsconfig.common',
        'tsconfig.dev',
        'tsconfig.development',
        'tsconfig.e2e',
        'tsconfig.eslint',
        'tsconfig.node',
        'tsconfig.prod',
        'tsconfig.production',
        'tsconfig.server',
        'tsconfig.spec',
        'tsconfig.staging',
        'tsconfig.test',
        'tsconfig.lib',
        'tsconfig.lib.prod',
      ],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'tsconfig_official',
      extensions: [],
      filenamesGlob: [
        'tsconfig',
        'tsconfig.app',
        'tsconfig.base',
        'tsconfig.common',
        'tsconfig.dev',
        'tsconfig.development',
        'tsconfig.e2e',
        'tsconfig.node',
        'tsconfig.prod',
        'tsconfig.production',
        'tsconfig.server',
        'tsconfig.spec',
        'tsconfig.staging',
        'tsconfig.test',
        'tsconfig.lib',
        'tsconfig.lib.prod',
      ],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'tslint',
      extensions: ['tslint.json', 'tslint.yaml', 'tslint.yml'],
      filename: true,

    },
    {
      icon: 'ttcn',
      extensions: [],
      languages: [languages.ttcn],

    },
    {
      icon: 'tuc',
      extensions: [],
      languages: [languages.tuc],

    },
    {
      icon: 'twig',
      extensions: [],
      languages: [languages.twig],

    },
    {
      icon: 'typedoc',
      extensions: [],
      filenamesGlob: ['typedoc'],
      extensionsGlob: ['js', 'json'],
      filename: true,

    },
    {
      icon: 'typescript',
      extensions: [],
      languages: [languages.typescript],

    },
    {
      icon: 'typescript_official',
      extensions: [],
      languages: [languages.typescript],

    },
    {
      icon: 'typescriptdef',
      extensions: ['d.ts', 'd.cts', 'd.mts'],

    },
    {
      icon: 'typescriptdef_official',
      extensions: ['d.ts', 'd.cts', 'd.mts'],

    },
    {
      icon: 'typo3',
      extensions: [],
      languages: [languages.typo3],

    },
    {
      icon: 'unibeautify',
      extensions: ['.unibeautifyrc', 'unibeautify.config.js'],
      filenamesGlob: ['.unibeautifyrc'],
      extensionsGlob: ['js', 'json', 'yaml', 'yml'],
      filename: true,

    },
    {
      icon: 'unlicense',
      extensions: ['unlicense', 'unlicence'],
      filenamesGlob: ['unlicense', 'unlicence'],
      extensionsGlob: ['md', 'txt'],
      filename: true,

    },
    {
      icon: 'vagrant',
      extensions: ['vagrantfile'],
      filename: true,

    },
    { icon: 'vala', extensions: ['vala'] },
    { icon: 'vanilla_extract', extensions: ['css.ts'] },
    { icon: 'vapi', extensions: ['vapi'] },
    {
      icon: 'vash', extensions: ['vash'],
    },
    {
      icon: 'vapor',
      extensions: ['vapor.yml'],
      filename: true,

    },
    {
      icon: 'vb',
      extensions: [],
      languages: [languages.vb],

    },
    {
      icon: 'vba',
      extensions: [],
      languages: [languages.vba],

    },
    { icon: 'vbhtml', extensions: ['vbhtml'] },
    { icon: 'vbproj', extensions: ['vbproj'] },
    { icon: 'vcxproj', extensions: ['vcxproj'] },
    {
      icon: 'velocity',
      extensions: [],
      languages: [languages.velocity],

    },
    {
      icon: 'verilog',
      extensions: [],
      languages: [languages.verilog],

    },
    {
      icon: 'vhdl',
      extensions: [],
      languages: [languages.vhdl],

    },
    {
      // https://en.wikipedia.org/wiki/Video_file_format
      icon: 'video',
      extensions: [
        '3g2',
        '3gp',
        'asf',
        'amv',
        'avi',
        'divx',
        'qt',
        'f4a',
        'f4b',
        'f4p',
        'f4v',
        'flv',
        'm2v',
        'm4v',
        'mkv',
        'mk3d',
        'mov',
        'mp2',
        'mp4',
        'mpe',
        'mpeg',
        'mpeg2',
        'mpg',
        'mpv',
        'nsv',
        'ogv',
        'rm',
        'rmvb',
        'svi',
        'vob',
        'webm',
        'wmv',
      ],

    },
    { icon: 'view', extensions: [] },
    {
      icon: 'vim',
      extensions: ['.vimrc', '.gvimrc'],
      filename: true,
      languages: [languages.viml],

    },
    {
      icon: 'vite',
      filenamesGlob: ['vite.config'],
      extensions: [],
      extensionsGlob: ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'],
      filename: true,

    },
    {
      // Taken from https://vitest.dev/logo.svg
      icon: 'vitest',
      // See https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/constants.ts
      filenamesGlob: ['vitest.config'],
      extensions: [],
      extensionsGlob: ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'],
      filename: true,

    },
    {
      icon: 'vlang',
      extensions: [],
      languages: [languages.vlang],

    },
    {
      icon: 'volt',
      extensions: [],
      languages: [languages.volt],

    },
    {
      icon: 'vscode',
      extensions: ['.vscodeignore'],
      filenamesGlob: ['launch', 'tasks', 'vscodeignore'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'vscode2',
      extensions: ['.vscodeignore'],
      filenamesGlob: ['launch', 'tasks', 'vscodeignore'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'vscode3',
      extensions: ['.vscodeignore'],
      filenamesGlob: ['launch', 'tasks', 'vscodeignore'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'vscode-insiders',
      extensions: ['.vscodeignore'],
      filenamesGlob: ['launch', 'tasks', 'vscodeignore'],
      extensionsGlob: ['json'],
      filename: true,

    },
    {
      icon: 'vsix', extensions: ['vsix'],
    },
    {
      icon: 'vsixmanifest',
      extensions: ['vsixmanifest'],

    },
    {
      icon: 'vue',
      extensions: [],
      languages: [languages.vue],

    },
    {
      icon: 'vueconfig',
      extensions: [
        '.vuerc',
        'vue.config.js',
        'vue.config.cjs',
        'vue.config.mjs',
      ],
      filename: true,

    },
    {
      icon: 'wallaby',
      extensions: [],
      filenamesGlob: ['wallaby', 'wallaby.conf', '.wallaby', '.wallaby.conf'],
      extensionsGlob: ['json', 'js', 'ts', 'coffee'],
      filename: true,

    },
    {
      icon: 'watchmanconfig',
      extensions: ['.watchmanconfig'],
      filename: true,

    },
    {
      icon: 'wasm',
      extensions: ['wasm'],
      languages: [languages.wasm],

    },
    {
      icon: 'webpack',
      extensions: [],
      filenamesGlob: [
        'webpack.base.conf',
        'webpack.common',
        'webpack.config',
        'webpack.config.base',
        'webpack.config.common',
        'webpack.config.dev',
        'webpack.config.development',
        'webpack.config.staging',
        'webpack.config.test',
        'webpack.config.prod',
        'webpack.config.production',
        'webpack.config.babel',
        'webpack.config.base.babel',
        'webpack.config.common.babel',
        'webpack.config.dev.babel',
        'webpack.config.development.babel',
        'webpack.config.staging.babel',
        'webpack.config.test.babel',
        'webpack.config.prod.babel',
        'webpack.config.production.babel',
        'webpack.dev',
        'webpack.dev.conf',
        'webpack.prod',
        'webpack.prod.conf',
        'webpack.main.config',
        'webpack.mix',
        'webpack.plugins',
        'webpack.renderer.config',
        'webpack.rules',
        'webpack.test.conf',
      ],
      extensionsGlob: ['js', 'cjs', 'mjs', 'coffee', 'ts'],
      filename: true,

    },
    {
      icon: 'wenyan',
      extensions: [],
      languages: [languages.wenyan],

    },
    {
      icon: 'wercker',
      extensions: ['wercker.yml'],
      filename: true,

    },
    {
      icon: 'wikitext',
      extensions: ['wikitext'],
      languages: [languages.wikitext],

    },
    {
      // Taken from https://windicss.org/assets/logo.svg
      icon: 'windi',
      // See: https://windicss.org/guide/configuration.html#config-file
      extensions: ['windi.config.ts', 'windi.config.js'],
      filename: true,

    },
    {
      icon: 'wolfram',
      extensions: [],
      languages: [languages.wolfram],

    },
    {
      icon: 'word',
      extensions: ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'wll'],

    },
    {
      icon: 'word2',
      extensions: ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'wll'],

    },
    {
      icon: 'wpml',
      extensions: ['wpml-config.xml'],
      filename: true,

    },
    {
      icon: 'wurst',
      extensions: [],
      languages: [languages.wurst],

    },
    { icon: 'wxml', extensions: ['wxml'] },
    { icon: 'wxss', extensions: ['wxss'] },
    { icon: 'xcode', extensions: ['xcodeproj'] },
    {
      icon: 'xfl',
      extensions: ['xfl'],

    },
    { icon: 'xib', extensions: ['xib'] },
    { icon: 'xliff', extensions: ['xliff', 'xlf'] },
    {
      icon: 'xmake',
      extensions: [],
      languages: [languages.xmake],

    },
    {
      icon: 'xml',
      extensions: ['pex', 'tmlanguage'],
      languages: [languages.xml],

    },
    {
      icon: 'xquery',
      extensions: [],
      languages: [languages.xquery],

    },
    {
      icon: 'xsl',
      extensions: [],
      languages: [languages.xsl],

    },
    {
      icon: 'yacc',
      extensions: [],
      languages: [languages.yacc],

    },
    {
      icon: 'yaml',
      extensions: [],
      languages: [
        languages.yaml,
        languages.textmateyaml,
        languages.springbootpropertiesyaml,
      ],

    },
    {
      icon: 'yamllint',
      extensions: ['.yamllint'],
      filename: true,

    },
    {
      icon: 'yandex',
      extensions: ['.yaspellerrc', '.yaspeller.json'],
      filename: true,

    },
    {
      icon: 'yang',
      extensions: [],
      languages: [languages.yang],

    },
    {
      icon: 'yarn',
      extensions: [
        'yarn.lock',
        '.yarnrc',
        '.yarnrc.yml',
        '.yarnclean',
        '.yarn-integrity',
        '.yarn-metadata.json',
        '.yarnignore',
      ],
      filename: true,

    },
    {
      icon: 'yeoman',
      extensions: ['.yo-rc.json'],
      filename: true,

    },
    {
      icon: 'zeit',
      extensions: ['now.json', '.nowignore', 'vercel.json', '.vercelignore'],

      filename: true,

    },
    {
      icon: 'zig',
      extensions: [],
      languages: [languages.zig],

    },
    {
      icon: 'turbo',
      extensions: ['turbo.json'],

      filename: true,

    },
    {
      icon: 'doppler',
      extensions: ['doppler.yaml', 'doppler-template.yaml'],
      filename: true,

    },
    {
      icon: 'zip',
      extensions: [
        'zip',
        'rar',
        '7z',
        'tar',
        'tgz',
        'bz',
        'gz',
        'bzip2',
        'xz',
        'bz2',
        'zipx',
        'br',
      ],

    },
    {
      icon: 'zip2',
      extensions: [
        'zip',
        'rar',
        '7z',
        'tar',
        'tgz',
        'bz',
        'gz',
        'bzip2',
        'xz',
        'bz2',
        'zipx',
        'br',
      ],

    },
  ],
};

export default extensions;
