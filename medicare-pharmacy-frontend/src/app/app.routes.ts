import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { CustomerLayout } from './layouts/customer-layout/customer-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';

import { Home } from './features/customer/home/home';
import { Products } from './features/customer/products/products';
import { ProductDetail } from './features/customer/product-detail/product-detail';
import { Cart } from './features/customer/cart/cart';
import { Checkout } from './features/customer/checkout/checkout';
import { MyOrders } from './features/customer/my-orders/my-orders';
import { UploadPrescription } from './features/customer/upload-prescription/upload-prescription';
import { Profile } from './features/customer/profile/profile';

import { Dashboard } from './features/admin/dashboard/dashboard';
import { Users } from './features/admin/users/users';
import { Categories } from './features/admin/categories/categories';
import { Products as AdminProducts } from './features/admin/products/products';
import { Inventory } from './features/admin/inventory/inventory';
import { Orders } from './features/admin/orders/orders';
import { Prescriptions } from './features/admin/prescriptions/prescriptions';
import { Reports } from './features/admin/reports/reports';

import { NotFound } from './features/common/not-found/not-found';

import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      },
      {
        path: 'forgot-password',
        component: ForgotPassword
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'users',
        component: Users
      },
      {
        path: 'categories',
        component: Categories
      },
      {
        path: 'products',
        component: AdminProducts
      },
      {
        path: 'inventory',
        component: Inventory
      },
      {
        path: 'orders',
        component: Orders
      },
      {
        path: 'prescriptions',
        component: Prescriptions
      },
      {
        path: 'reports',
        component: Reports
      }
    ]
  },
  {
    path: '',
    component: CustomerLayout,
    children: [
      {
        path: '',
        component: Home
      },
      {
        path: 'products',
        component: Products
      },
      {
        path: 'products/:slug',
        component: ProductDetail
      },
      {
        path: 'cart',
        component: Cart,
        canActivate: [customerGuard]
      },
      {
        path: 'checkout',
        component: Checkout,
        canActivate: [customerGuard]
      },
      {
        path: 'my-orders',
        component: MyOrders,
        canActivate: [customerGuard]
      },
      {
        path: 'upload-prescription',
        component: UploadPrescription,
        canActivate: [customerGuard]
      },
      {
        path: 'profile',
        component: Profile,
        canActivate: [customerGuard]
      }
    ]
  },
  {
    path: 'not-found',
    component: NotFound
  },
  {
    path: '**',
    component: NotFound
  }
];