
import axios from 'axios'
import createVuexStore from '../../../mock-data/mock-data'



describe ('Vuex: Pruebas en el auth-module',()=>{
    test('Estado incial', ()=>{
        const store = createVuexStore({
            status: 'authenticating',
            user: null,
            idToken: null,
            refreshToken: null
        })
        const {status, user, idToken, refreshToken} = store.state.auth
            expect(status).toBe('authenticating')
            expect(user).toBe(null)
            expect(idToken).toBe(null)
            expect(refreshToken).toBe(null)
    })
    //test: Muttations
    test('Muttation: loginUser', ()=>{
        const store = createVuexStore({
            status: 'authenticating',
            user: null,
            idToken: null,
            refreshToken: null
        })
        const payload ={
            user: {name: 'Osvaldo', email: 'osvaldo@gmail.com'},
            idToken: 'ABC-123',
            refreshToken: 'XYZ-123' 
        }
        store.commit('auth/loginUser', payload)

        const {status, user, idToken, refreshToken} = store.state.auth

            expect(status).toBe('authenticated')
            expect(user).toEqual({name: 'Osvaldo', email: 'osvaldo@gmail.com'})
            expect(idToken).toBe('ABC-123')
            expect(refreshToken).toBe('XYZ-123')
    })
    test('Mutattion: logout', ()=>{

        localStorage.setItem('idToken','ABC-123')
        localStorage.setItem('refreshToken','XYZ-123')
        
        const store = createVuexStore({
            status: 'authenticated',
            user: {name: 'Claudio', email: 'cla@gmail.com'},
            idToken: 'ABC-123',
            refreshToken: 'XYZ-456'
        })
        store.commit('auth/logout')

        const {status, user, idToken, refreshToken} = store.state.auth

            expect(status).toBe('not-authenticated')
            expect(user).toBeFalsy()
            expect(idToken).toBeFalsy()
            expect(refreshToken).toBeFalsy()

            expect( localStorage.getItem('idToken')).toBeFalsy()
            expect( localStorage.getItem('refreshToken ')).toBeFalsy()
    })
    //Getters
    test('Getter: username currentState', ()=>{
        const store = createVuexStore({
            status: 'authenticated',
            user: {name: 'Claudio', email: 'cla@gmail.com'},
            idToken: 'ABC-123',
            refreshToken: 'XYZ-456'
        })
        expect (store.getters['auth/currentState']).toBe('authenticated')
        expect (store.getters['auth/username']).toBe('Claudio')
    })
    //Action
    test('Actions: createUser- Error usuario ya existe', async ()=>{
        const store = createVuexStore({
            status: 'not-authenticated',
            user: null,
            idToken: null,
            refreshToken: null  
        })

        const newUser = {name: 'Test User', email:'test@test.com', password:'123456'}
        const resp = await store.dispatch('auth/createUser', newUser)
        expect (resp).toEqual({ok:false, message: 'EMAIL_EXISTS'})

        const {status, user, idToken, refreshToken} = store.state.auth

        expect(status).toBe('not-authenticated')
        expect(user).toBeFalsy()
        expect(idToken).toBeFalsy()
        expect(refreshToken).toBeFalsy()
    })
    test('Actions: createUser signInUser - Crea el usuario', async()=>{
        const store = createVuexStore({
        status: 'not-authenticated',
        user: null,
        idToken: null,
        refreshToken: null  
        })
        const newUser = {name: 'Dylan', email:'dylan@gmail.com', password:'123456'}
        //Sign In
        await store.dispatch('auth/signInUser', newUser)
        const {idToken} = store.state.auth
        //Borrar el usuario
        const deleteResp = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=AIzaSyDhtzkyjapLvXvbFm4zDL3Gjum7TkOuhBk`,{
            idToken
        })
        //Crear usuario
        const resp = await store.dispatch('auth/createUser', newUser)

        expect(resp).toEqual({ok: true})
        
        const {status, user, idToken:token, refreshToken} = store.state.auth

        expect(status).toBe('authenticated')
        expect(user).toMatchObject({name: 'Dylan', email:'dylan@gmail.com'})
        expect(typeof token).toBe('string')
        expect(typeof refreshToken).toBe('string')
    })
    test('Actions: checkAuthentication - POSITIVA',async()=> { 
        
        const store = createVuexStore({
            status: 'not-authenticated',
            user: null,
            idToken: null,
            refreshToken: null  
            })
        //signIn}
        const signInResp = await store.dispatch('auth/signInUser', {email:'test@test.com', password: '123456'})
        const {idToken} = store.state.auth

            store.commit('auth/logout')

            localStorage.setItem('idToken', idToken)

        const checkResp = await store.dispatch('auth/checkAuthentication')
        const {status, user, idToken:token, refreshToken} = store.state.auth

        expect(checkResp).toEqual({ok:true})

        expect(status).toBe('authenticated')
        expect(user).toMatchObject({name: 'User Test', email:'test@test.com'})
        expect(typeof token).toBe('string')
    })
    test('Actions - checkAuthentication - NEGATIVA',async ()=>{
        const store = createVuexStore({
            status: 'not-authenticated',
            user: null,
            idToken: null,
            refreshToken: null  
            })
            localStorage.removeItem('idToken')
            const checkResp1 = await store.dispatch('auth/checkAuthentication')
            expect(checkResp1).toEqual({ ok: false, message: 'No hay Token' })
            
            expect(store.state.auth.status).toBe('not-authenticated')

            localStorage.setItem('idToken','ABC-123')
            const checkResp2 = await store.dispatch('auth/checkAuthentication')
            expect(checkResp2).toEqual( { ok: false, message: 'INVALID_ID_TOKEN' })
            expect( store.state.auth.status).toBe('not-authenticated')
        })  
})