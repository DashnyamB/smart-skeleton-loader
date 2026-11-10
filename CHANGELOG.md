## [2.1.1](https://github.com/DashnyamB/smart-skeleton-loader/compare/v2.1.0...v2.1.1) (2026-11-10)


### Bug Fixes

* support server components and avoid a blank server-rendered frame ([#28](https://github.com/DashnyamB/smart-skeleton-loader/issues/28)) ([a8078ed](https://github.com/DashnyamB/smart-skeleton-loader/commit/a8078ede8aee341ef3a6fd31d01e939fdf237f57))

# [2.1.0](https://github.com/DashnyamB/smart-skeleton-loader/compare/v2.0.0...v2.1.0) (2026-11-10)


### Features

* add delay and minDuration with a skeleton/content crossfade ([#24](https://github.com/DashnyamB/smart-skeleton-loader/issues/24)) ([70a76c1](https://github.com/DashnyamB/smart-skeleton-loader/commit/70a76c143256873ec0be7bd110b4938151df7b28))

# [2.0.0](https://github.com/DashnyamB/smart-skeleton-loader/compare/v1.0.1...v2.0.0) (2026-11-10)


* fix!: drop all runtime dependencies and fix package exports ([#20](https://github.com/DashnyamB/smart-skeleton-loader/issues/20)) ([5feccf1](https://github.com/DashnyamB/smart-skeleton-loader/commit/5feccf1aacef34756beaa9a57f14249d1867362d))


### Bug Fixes

* **deps:** update all dependencies to latest ([#17](https://github.com/DashnyamB/smart-skeleton-loader/issues/17)) ([cf538e7](https://github.com/DashnyamB/smart-skeleton-loader/commit/cf538e7cdac066dfb29168987de5f20984e853e5)), closes [#2](https://github.com/DashnyamB/smart-skeleton-loader/issues/2) [#3](https://github.com/DashnyamB/smart-skeleton-loader/issues/3) [#5](https://github.com/DashnyamB/smart-skeleton-loader/issues/5) [#6](https://github.com/DashnyamB/smart-skeleton-loader/issues/6) [#11](https://github.com/DashnyamB/smart-skeleton-loader/issues/11) [#12](https://github.com/DashnyamB/smart-skeleton-loader/issues/12) [#13](https://github.com/DashnyamB/smart-skeleton-loader/issues/13) [#14](https://github.com/DashnyamB/smart-skeleton-loader/issues/14) [#15](https://github.com/DashnyamB/smart-skeleton-loader/issues/15) [#18](https://github.com/DashnyamB/smart-skeleton-loader/issues/18) [#19](https://github.com/DashnyamB/smart-skeleton-loader/issues/19)
* make hidden content inert and announce loading state ([#21](https://github.com/DashnyamB/smart-skeleton-loader/issues/21)) ([4bd1fc4](https://github.com/DashnyamB/smart-skeleton-loader/commit/4bd1fc4e088e6ae23137de8350f07b322f350c86))
* render the wrapper as a block so it fills its parent ([#22](https://github.com/DashnyamB/smart-skeleton-loader/issues/22)) ([735f717](https://github.com/DashnyamB/smart-skeleton-loader/commit/735f71788c616a0ebd807a1cb9b79b76b81f302a))


### Features

* draw one skeleton bar per rendered text line ([#23](https://github.com/DashnyamB/smart-skeleton-loader/issues/23)) ([7094a05](https://github.com/DashnyamB/smart-skeleton-loader/commit/7094a057515b1b86248aa7b5176b52c90882ca06))


### BREAKING CHANGES

* SkeletonPrimitiveProps now extends
React.HTMLAttributes<HTMLDivElement> instead of HTMLMotionProps<'div'>,
and react >=19 is required as a peer dependency.

## [1.0.1](https://github.com/DashnyamB/smart-skeleton-loader/compare/v1.0.0...v1.0.1) (2026-02-03)


### Bug Fixes

* module resolution ([80b9243](https://github.com/DashnyamB/smart-skeleton-loader/commit/80b9243df046c01fe67ca9dfe2893526d7b51878))

# 1.0.0 (2026-02-03)


### Bug Fixes

* build ([a2c9e3a](https://github.com/DashnyamB/smart-skeleton-loader/commit/a2c9e3a5daad513db1361ec7e441623e36bb9115))
* build ([8bf1c74](https://github.com/DashnyamB/smart-skeleton-loader/commit/8bf1c7418a7e32d24be8cff60770c8a136f32bf5))
* fix ([f7e1e8d](https://github.com/DashnyamB/smart-skeleton-loader/commit/f7e1e8d5df392e0fdce8f086aaed5ee71a93b741))
* fix ([0950860](https://github.com/DashnyamB/smart-skeleton-loader/commit/09508602c5e27e2a8a12657168cb35de8205251b))
* fix ([2773248](https://github.com/DashnyamB/smart-skeleton-loader/commit/277324880e9b7b338d24f098421cd80d64ee6a2a))
* fix ([696d62c](https://github.com/DashnyamB/smart-skeleton-loader/commit/696d62c3427f58c0e92a2dd3cded87ae6ec33d26))
* ifx ([0422a16](https://github.com/DashnyamB/smart-skeleton-loader/commit/0422a1615fd0d0d177d1eb7ceda96213a7433c1c))
* release ([2a1f47f](https://github.com/DashnyamB/smart-skeleton-loader/commit/2a1f47f204801ecd2cfabfa2bcd50a5921ca467a))
* release ([e559fe1](https://github.com/DashnyamB/smart-skeleton-loader/commit/e559fe1cacf3a0559273d12cc94019416bca47a8))


### Features

* initial commit ([cb2275c](https://github.com/DashnyamB/smart-skeleton-loader/commit/cb2275c3c69660e544b307ff4cd35d30170e4073))
* trigger ([c25d494](https://github.com/DashnyamB/smart-skeleton-loader/commit/c25d494d0dc6da23d248f6f3516b943f24eb508e))
* trigger ([d86ef88](https://github.com/DashnyamB/smart-skeleton-loader/commit/d86ef8887e7d33429a7b4b023a4898ac533d240c))
* trigger ([69420c0](https://github.com/DashnyamB/smart-skeleton-loader/commit/69420c0f98f216a58fa055d13e39bad4e804411f))
* trigger ([da7ab4b](https://github.com/DashnyamB/smart-skeleton-loader/commit/da7ab4b9904085a2c643443ab9b253b030977b0d))
* trigger ([507eb6f](https://github.com/DashnyamB/smart-skeleton-loader/commit/507eb6fa8e2515d4c8ae4ca85e74bea598852cdc))
* trigger ([f70627c](https://github.com/DashnyamB/smart-skeleton-loader/commit/f70627c2dab04a3d666da3f82a94d5194baa1213))
