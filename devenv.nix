{
  pkgs,
  ...
}:

{
  # https://devenv.sh/packages/
  packages = with pkgs; [
  ];

  git-hooks.hooks = {
    trim-trailing-whitespace.enable = true;
    end-of-file-fixer.enable = true;
    check-yaml.enable = true; # Does not validate schema
    check-added-large-files.enable = true;
    check-case-conflicts.enable = true;
    actionlint.enable = true;
    trufflehog.enable = true;
    biome.enable = true;
    tsc = {
      enable = true;
      entry = "pnpm exec tsc --noEmit";
      pass_filenames = false;
      files = "^src/.*\\.tsx?$";
    };
  };

  languages.javascript = {
    enable = true;
    corepack.enable = true;
    pnpm.enable = true;
    pnpm.install.enable = true;
  };
}
