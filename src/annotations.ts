import { data$ } from './extension';

data$.subscribe((e) => {
  console.log('Here in data ', e);
});
