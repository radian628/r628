echo '
if [ $0 == "-rm" ]; then
  git rm r628
elif [ -d "./r628" ]; then
  if [ $0 == "force" ]; then
    git submodule update --recursive --remote --force r628
  else
    git submodule update --recursive --remote r628
  fi
else
  git submodule add https://github.com/radian628/r628
fi
' > /usr/local/bin/r628
chmod +x /usr/local/bin/r628