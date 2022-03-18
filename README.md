<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://resuspend.js.org" rel="noopener" target="_blank"><img height="100" src="https://gist.githubusercontent.com/json2d/ffbf9ae39c31a3e1ea1c84277e157f1d/raw/47841d8a111f706cb56ef98542dcb0610284c5c1/resuspend-yarn.svg" alt='Resuspend Logo'></a>
</p>

<h1 align="center">resuspend
<p align="center" style="font-size:.5em">(workspace)</p>
</h1>

<div align="center">

this is a [Yarn workspace](https://classic.yarnpkg.com/lang/en/docs/workspaces/) project composed of [multiple packages](#packages) including the core [`resuspend`](https://github.com/json2d/resuspend/blob/main/packages/resuspend) library, [integrations](#integrations), and other related sub-projects

</div>

## getting started

to install project dependencies:

```sh
yarn install
```

to build the core library:

```
cd packages/resuspend
yarn build
```

> don't forget the build step because the builds are the targets when importing between sibling packages, not the source code itself!

## packages

### core
[`resuspend`](https://github.com/json2d/resuspend/blob/main/packages/resuspend)

### integrations
[`@resuspend/redux`](https://github.com/json2d/resuspend/blob/main/packages/redux)